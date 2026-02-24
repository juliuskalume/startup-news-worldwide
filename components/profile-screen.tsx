"use client";

import { BottomNav } from "@/components/bottom-nav";
import { useTheme } from "@/components/providers/theme-provider";
import { getSavedArticles, getStoredCountry } from "@/lib/storage";
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

  return (
    <div className="relative min-h-screen pb-24">
      <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/90 backdrop-blur dark:border-[#1d283d] dark:bg-[#081120]/90">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-text-main dark:text-[#ebf2ff]">Profile</h1>
          <p className="mt-1 text-sm text-text-muted dark:text-[#8fa8d2]">
            Personalization and app preferences
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 sm:px-6">
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
          <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">MVP State</h2>
          <ul className="mt-3 space-y-2 text-sm text-text-muted dark:text-[#8fa8d2]">
            <li>Current region: {getStoredCountry("US")}</li>
            <li>Saved articles: {getSavedArticles().length}</li>
            <li>Account sync: Coming soon</li>
          </ul>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
