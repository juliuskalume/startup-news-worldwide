"use client";

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { z } from "zod";
import { useAuth } from "@/components/providers/auth-provider";
import { db } from "@/lib/firebase";
import {
  applyRemoteUserDataSnapshot,
  getLocalSyncUpdatedAt,
  getLocalUserDataSnapshot,
  STORAGE_SYNC_EVENT,
  storageKeys,
  StorageSyncEventDetail,
  SyncedUserData,
  touchLocalSyncUpdatedAt,
} from "@/lib/storage";
import { CATEGORIES, COUNTRY_CODES } from "@/lib/types";

const SYNC_DEBOUNCE_MS = 450;

const syncCountrySchema = z.enum(COUNTRY_CODES);
const syncThemeSchema = z.enum(["light", "dark", "system"]);
const syncCategorySchema = z.enum(CATEGORIES);

const syncedArticleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  link: z.string().min(1),
  source: z.string().min(1),
  publishedAt: z.string().min(1),
  author: z.string().optional(),
  excerpt: z.string().optional(),
  imageUrl: z.string().optional(),
  category: syncCategorySchema.optional(),
  country: syncCountrySchema.optional(),
  readTimeMin: z.number().int().min(0).optional(),
});

const syncedUserDocSchema = z
  .object({
    savedArticles: z.array(syncedArticleSchema).catch([]),
    country: syncCountrySchema.catch("US"),
    theme: syncThemeSchema.catch("system"),
    readerTextSize: z.number().int().min(0).max(2).catch(1),
    updatedAt: z.number().int().min(0).catch(0),
  })
  .catch({
    savedArticles: [],
    country: "US",
    theme: "system",
    readerTextSize: 1,
    updatedAt: 0,
  });

const syncObservedKeys = new Set<string>([
  storageKeys.saved,
  storageKeys.country,
  storageKeys.theme,
  storageKeys.readerSize,
  storageKeys.syncUpdatedAt,
]);

function parseRemoteUserData(input: unknown): SyncedUserData {
  return syncedUserDocSchema.parse(input);
}

function hasLocalCustomization(snapshot: SyncedUserData): boolean {
  return (
    snapshot.savedArticles.length > 0 ||
    snapshot.country !== "US" ||
    snapshot.theme !== "system" ||
    snapshot.readerTextSize !== 1
  );
}

export function UserSyncProvider({ children }: PropsWithChildren): JSX.Element {
  const { user, loading } = useAuth();
  const [syncReady, setSyncReady] = useState<boolean>(false);

  const pushTimeoutRef = useRef<number | null>(null);
  const isApplyingRemoteRef = useRef<boolean>(false);
  const lastUploadedAtRef = useRef<number>(0);

  const clearScheduledPush = useCallback((): void => {
    if (pushTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(pushTimeoutRef.current);
    pushTimeoutRef.current = null;
  }, []);

  const pushSnapshot = useCallback(
    async (snapshot: SyncedUserData): Promise<void> => {
      if (!user) {
        return;
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          savedArticles: snapshot.savedArticles,
          country: snapshot.country,
          theme: snapshot.theme,
          readerTextSize: snapshot.readerTextSize,
          updatedAt: snapshot.updatedAt,
          updatedAtServer: serverTimestamp(),
        },
        { merge: true }
      );
      lastUploadedAtRef.current = snapshot.updatedAt;
    },
    [user]
  );

  const schedulePushFromLocal = useCallback((): void => {
    if (!user || isApplyingRemoteRef.current) {
      return;
    }

    clearScheduledPush();

    pushTimeoutRef.current = window.setTimeout(() => {
      void (async () => {
        const local = getLocalUserDataSnapshot("US");
        if (!local.updatedAt || local.updatedAt <= lastUploadedAtRef.current) {
          return;
        }

        try {
          await pushSnapshot(local);
        } catch (error) {
          console.error("Failed to sync local preferences to Firestore", error);
        }
      })();
    }, SYNC_DEBOUNCE_MS);
  }, [clearScheduledPush, pushSnapshot, user]);

  useEffect(() => {
    if (loading) {
      setSyncReady(false);
      return;
    }

    clearScheduledPush();

    if (!user) {
      lastUploadedAtRef.current = 0;
      setSyncReady(true);
      return;
    }

    let cancelled = false;
    let unsubscribeRemote: (() => void) | null = null;

    const handleStorageSync = (event: Event): void => {
      const customEvent = event as CustomEvent<StorageSyncEventDetail>;
      const detail = customEvent.detail;

      if (!detail || detail.reason !== "local") {
        return;
      }

      if (!detail.keys.some((key) => syncObservedKeys.has(key))) {
        return;
      }

      schedulePushFromLocal();
    };

    const handleStorage = (event: StorageEvent): void => {
      if (!event.key || !syncObservedKeys.has(event.key)) {
        return;
      }

      schedulePushFromLocal();
    };

    const startSync = async (): Promise<void> => {
      setSyncReady(false);

      const userDocRef = doc(db, "users", user.uid);

      try {
        const localSnapshot = getLocalUserDataSnapshot("US");
        const remoteDoc = await getDoc(userDocRef);
        const remoteSnapshot = remoteDoc.exists()
          ? parseRemoteUserData(remoteDoc.data())
          : null;

        if (remoteSnapshot && remoteSnapshot.updatedAt > localSnapshot.updatedAt) {
          isApplyingRemoteRef.current = true;
          applyRemoteUserDataSnapshot(remoteSnapshot);
          isApplyingRemoteRef.current = false;
          lastUploadedAtRef.current = remoteSnapshot.updatedAt;
        } else if (remoteSnapshot && localSnapshot.updatedAt === remoteSnapshot.updatedAt) {
          if (!remoteSnapshot.updatedAt && hasLocalCustomization(localSnapshot)) {
            const stampedLocal = {
              ...localSnapshot,
              updatedAt: touchLocalSyncUpdatedAt(Date.now()),
            };
            await pushSnapshot(stampedLocal);
          } else {
            isApplyingRemoteRef.current = true;
            applyRemoteUserDataSnapshot(remoteSnapshot);
            isApplyingRemoteRef.current = false;
            lastUploadedAtRef.current = remoteSnapshot.updatedAt;
          }
        } else {
          const snapshotToUpload = localSnapshot.updatedAt
            ? localSnapshot
            : { ...localSnapshot, updatedAt: touchLocalSyncUpdatedAt(Date.now()) };
          await pushSnapshot(snapshotToUpload);
        }

        unsubscribeRemote = onSnapshot(
          userDocRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              return;
            }

            const remote = parseRemoteUserData(snapshot.data());
            const localUpdatedAt = getLocalSyncUpdatedAt();
            if (remote.updatedAt <= localUpdatedAt) {
              return;
            }

            isApplyingRemoteRef.current = true;
            applyRemoteUserDataSnapshot(remote);
            isApplyingRemoteRef.current = false;
            lastUploadedAtRef.current = remote.updatedAt;
          },
          (error) => {
            console.error("Realtime Firestore sync listener failed", error);
          }
        );
      } catch (error) {
        console.error("Failed to initialize Firestore user sync", error);
      } finally {
        if (!cancelled) {
          setSyncReady(true);
        }
      }
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
    window.addEventListener("storage", handleStorage);

    void startSync();

    return () => {
      cancelled = true;
      clearScheduledPush();
      window.removeEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
      window.removeEventListener("storage", handleStorage);
      if (unsubscribeRemote) {
        unsubscribeRemote();
      }
    };
  }, [clearScheduledPush, loading, pushSnapshot, schedulePushFromLocal, user]);

  const syncWaitMessage = useMemo(
    () => (user ? "Syncing your cloud preferences..." : ""),
    [user]
  );

  if (!loading && user && !syncReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-subtle dark:bg-[#070f1c]">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-border-light bg-background-light px-4 py-2 text-sm font-semibold text-text-main shadow-soft dark:border-[#223148] dark:bg-[#10192c] dark:text-[#ebf2ff]">
          <span className="spinner-ring" />
          {syncWaitMessage}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
