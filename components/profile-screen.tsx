"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getSavedArticles,
  getStoredCountry,
  STORAGE_SYNC_EVENT,
  storageKeys,
  StorageSyncEventDetail,
} from "@/lib/storage";
import { ThemePreference } from "@/lib/types";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  title: string;
  description: string;
}> = [
  { value: "light", title: "Light", description: "Always use light mode" },
  { value: "dark", title: "Dark", description: "Always use dark mode" },
  {
    value: "system",
    title: "System",
    description: "Follow your device preference",
  },
];

export function ProfileScreen(): JSX.Element {
  const { theme, setTheme } = useTheme();
  const [savedCount, setSavedCount] = useState<number>(0);
  const [country, setCountry] = useState(getStoredCountry("US"));
  const {
    user,
    requiresEmailVerification,
    resendVerificationEmail,
    refreshVerificationStatus,
    signOutUser,
  } = useAuth();

  useEffect(() => {
    setSavedCount(getSavedArticles().length);
    setCountry(getStoredCountry("US"));

    const handleStorageSync = (event: Event): void => {
      const customEvent = event as CustomEvent<StorageSyncEventDetail>;
      const detail = customEvent.detail;
      if (!detail) {
        return;
      }

      if (detail.keys.includes(storageKeys.saved)) {
        setSavedCount(getSavedArticles().length);
      }

      if (detail.keys.includes(storageKeys.country)) {
        setCountry(getStoredCountry("US"));
      }
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
    };
  }, []);

  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/90 backdrop-blur dark:border-[#1d283d] dark:bg-[#081120]/90">
        <div className="app-content-container safe-top-container">
          <h1 className="text-xl font-bold text-text-main dark:text-[#ebf2ff]">Profile</h1>
          <p className="mt-1 text-sm text-text-muted dark:text-[#8fa8d2]">
            Personalization and app preferences
          </p>
        </div>
      </header>

      <main className="app-content-container grid gap-4 py-4 lg:grid-cols-2 lg:py-6">
        <section className="rounded-3xl border border-border-light bg-background-light p-4 shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
          <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">Theme</h2>
          <div className="mt-3 space-y-2">
            {THEME_OPTIONS.map((option) => {
              const active = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "focus-ring flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition",
                    active
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border-light bg-background-light text-text-main hover:border-primary/40 dark:border-[#263248] dark:bg-[#0d1728] dark:text-[#e7eefc]"
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold">{option.title}</span>
                    <span className="block text-xs text-text-muted dark:text-[#8fa8d2]">
                      {option.description}
                    </span>
                  </span>
                  {active ? (
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-border-light bg-background-light p-4 shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
          <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">Account</h2>
          <ul className="mt-3 space-y-2 text-sm text-text-muted dark:text-[#8fa8d2]">
            <li>Email: {user?.email ?? "Unknown"}</li>
            <li>Status: {requiresEmailVerification ? "Email not verified" : "Active"}</li>
            <li>Current region: {country}</li>
            <li>Saved articles: {savedCount}</li>
          </ul>
          <div className="mt-4 grid gap-2">
            {requiresEmailVerification ? (
              <>
                <button
                  type="button"
                  onClick={() => void refreshVerificationStatus()}
                  aria-label="Refresh verification status"
                  className="focus-ring inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  Check verification
                </button>
                <button
                  type="button"
                  onClick={() => void resendVerificationEmail()}
                  aria-label="Resend verification email"
                  className="focus-ring inline-flex items-center justify-center rounded-2xl border border-border-light bg-background-light px-4 py-2 text-sm font-semibold text-text-main transition hover:border-primary/40 dark:border-[#263248] dark:bg-[#0d1728] dark:text-[#e7eefc]"
                >
                  Resend verification email
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => void signOutUser()}
              aria-label="Sign out"
              className="focus-ring inline-flex items-center justify-center rounded-2xl border border-border-light bg-background-light px-4 py-2 text-sm font-semibold text-text-main transition hover:border-primary/40 dark:border-[#263248] dark:bg-[#0d1728] dark:text-[#e7eefc]"
            >
              Sign out
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-border-light bg-background-light p-4 shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
          <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">Legal</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Link
              href="/terms"
              className="focus-ring inline-flex items-center justify-center rounded-2xl border border-border-light bg-background-light px-4 py-2 text-sm font-semibold text-text-main transition hover:border-primary/40 dark:border-[#263248] dark:bg-[#0d1728] dark:text-[#e7eefc]"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="focus-ring inline-flex items-center justify-center rounded-2xl border border-border-light bg-background-light px-4 py-2 text-sm font-semibold text-text-main transition hover:border-primary/40 dark:border-[#263248] dark:bg-[#0d1728] dark:text-[#e7eefc]"
            >
              Privacy Policy
            </Link>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
