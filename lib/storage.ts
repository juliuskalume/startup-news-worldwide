import {
  Article,
  COUNTRY_CODES,
  CountryCode,
  ThemePreference,
} from "@/lib/types";

const SAVED_KEY = "newshub_saved";
const COUNTRY_KEY = "newshub_country";
const THEME_KEY = "newshub_theme";
const READER_SIZE_KEY = "newshub_reader_text_size";
const SYNC_UPDATED_AT_KEY = "newshub_sync_updated_at";

export const STORAGE_SYNC_EVENT = "newshub:storage-sync";

export type StorageSyncReason = "local" | "remote";

export type StorageSyncEventDetail = {
  keys: string[];
  reason: StorageSyncReason;
};

export type SyncedUserData = {
  savedArticles: Article[];
  country: CountryCode;
  theme: ThemePreference;
  readerTextSize: number;
  updatedAt: number;
};

type PersistOptions = {
  reason: StorageSyncReason;
  touchUpdatedAt: boolean;
  updatedAt?: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeReaderSize(size: number): number {
  if (!Number.isFinite(size)) {
    return 1;
  }

  return Math.max(0, Math.min(2, Math.round(size)));
}

function normalizeUpdatedAt(updatedAt: number): number {
  if (!Number.isFinite(updatedAt) || updatedAt < 0) {
    return 0;
  }

  return Math.floor(updatedAt);
}

function emitStorageSyncEvent(keys: string[], reason: StorageSyncReason): void {
  if (typeof window === "undefined" || !keys.length) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<StorageSyncEventDetail>(STORAGE_SYNC_EVENT, {
      detail: { keys, reason },
    })
  );
}

function persistToStorage(
  entries: Array<[string, string]>,
  options: PersistOptions
): void {
  if (!canUseStorage()) {
    return;
  }

  const changedKeys: string[] = [];

  for (const [key, value] of entries) {
    if (localStorage.getItem(key) === value) {
      continue;
    }

    localStorage.setItem(key, value);
    changedKeys.push(key);
  }

  if (!changedKeys.length) {
    return;
  }

  if (options.touchUpdatedAt) {
    const nextUpdatedAt = String(normalizeUpdatedAt(options.updatedAt ?? Date.now()));
    if (localStorage.getItem(SYNC_UPDATED_AT_KEY) !== nextUpdatedAt) {
      localStorage.setItem(SYNC_UPDATED_AT_KEY, nextUpdatedAt);
      changedKeys.push(SYNC_UPDATED_AT_KEY);
    }
  }

  emitStorageSyncEvent(changedKeys, options.reason);
}

export function getSavedArticles(): Article[] {
  if (!canUseStorage()) {
    return [];
  }

  const parsed = parseJson<Article[]>(localStorage.getItem(SAVED_KEY), []);
  return Array.isArray(parsed) ? parsed : [];
}

export function isSavedArticle(articleId: string): boolean {
  return getSavedArticles().some((item) => item.id === articleId);
}

export function setSavedArticles(items: Article[]): void {
  persistToStorage([[SAVED_KEY, JSON.stringify(items)]], {
    reason: "local",
    touchUpdatedAt: true,
  });
}

export function toggleSavedArticle(article: Article): boolean {
  const current = getSavedArticles();
  const exists = current.some((item) => item.id === article.id);

  if (exists) {
    setSavedArticles(current.filter((item) => item.id !== article.id));
    return false;
  }

  setSavedArticles([article, ...current]);
  return true;
}

export function removeSavedArticle(articleId: string): void {
  const current = getSavedArticles();
  setSavedArticles(current.filter((item) => item.id !== articleId));
}

export function getStoredCountry(defaultCountry: CountryCode = "US"): CountryCode {
  if (!canUseStorage()) {
    return defaultCountry;
  }

  const value = localStorage.getItem(COUNTRY_KEY);
  if (!value) {
    return defaultCountry;
  }

  return COUNTRY_CODES.includes(value as CountryCode)
    ? (value as CountryCode)
    : defaultCountry;
}

export function setStoredCountry(country: CountryCode): void {
  persistToStorage([[COUNTRY_KEY, country]], {
    reason: "local",
    touchUpdatedAt: true,
  });
}

export function getStoredTheme(): ThemePreference {
  if (!canUseStorage()) {
    return "system";
  }

  const value = localStorage.getItem(THEME_KEY);
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "system";
}

export function setStoredTheme(theme: ThemePreference): void {
  persistToStorage([[THEME_KEY, theme]], {
    reason: "local",
    touchUpdatedAt: true,
  });
}

export function getReaderTextSize(): number {
  if (!canUseStorage()) {
    return 1;
  }

  const value = Number(localStorage.getItem(READER_SIZE_KEY));
  return normalizeReaderSize(value);
}

export function setReaderTextSize(size: number): void {
  persistToStorage([[READER_SIZE_KEY, String(normalizeReaderSize(size))]], {
    reason: "local",
    touchUpdatedAt: true,
  });
}

export function getLocalSyncUpdatedAt(): number {
  if (!canUseStorage()) {
    return 0;
  }

  return normalizeUpdatedAt(Number(localStorage.getItem(SYNC_UPDATED_AT_KEY)));
}

export function touchLocalSyncUpdatedAt(
  updatedAt: number = Date.now(),
  reason: StorageSyncReason = "local"
): number {
  const normalized = normalizeUpdatedAt(updatedAt);
  persistToStorage([[SYNC_UPDATED_AT_KEY, String(normalized)]], {
    reason,
    touchUpdatedAt: false,
  });
  return normalized;
}

export function getLocalUserDataSnapshot(
  defaultCountry: CountryCode = "US"
): SyncedUserData {
  return {
    savedArticles: getSavedArticles(),
    country: getStoredCountry(defaultCountry),
    theme: getStoredTheme(),
    readerTextSize: getReaderTextSize(),
    updatedAt: getLocalSyncUpdatedAt(),
  };
}

export function applyRemoteUserDataSnapshot(data: SyncedUserData): void {
  const country = COUNTRY_CODES.includes(data.country) ? data.country : "US";
  const theme: ThemePreference =
    data.theme === "light" || data.theme === "dark" || data.theme === "system"
      ? data.theme
      : "system";
  const readerTextSize = normalizeReaderSize(data.readerTextSize);
  const updatedAt = normalizeUpdatedAt(data.updatedAt);
  const savedArticles = Array.isArray(data.savedArticles) ? data.savedArticles : [];

  persistToStorage(
    [
      [SAVED_KEY, JSON.stringify(savedArticles)],
      [COUNTRY_KEY, country],
      [THEME_KEY, theme],
      [READER_SIZE_KEY, String(readerTextSize)],
      [SYNC_UPDATED_AT_KEY, String(updatedAt)],
    ],
    {
      reason: "remote",
      touchUpdatedAt: false,
    }
  );
}

export const storageKeys = {
  saved: SAVED_KEY,
  country: COUNTRY_KEY,
  theme: THEME_KEY,
  readerSize: READER_SIZE_KEY,
  syncUpdatedAt: SYNC_UPDATED_AT_KEY,
} as const;
