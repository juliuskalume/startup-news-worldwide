"use client";

import { CountryCode, COUNTRY_META } from "@/lib/types";
import { MaterialIcon } from "@/components/material-icon";
import { ThemeToggle } from "@/components/theme-toggle";

type HeaderBarProps = {
  country: CountryCode;
  onCountryClick: () => void;
  onSearchClick?: () => void;
};

function flagEmoji(countryFlagCode: string): string {
  return countryFlagCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

export function HeaderBar({
  country,
  onCountryClick,
  onSearchClick,
}: HeaderBarProps): JSX.Element {
  const countryMeta = COUNTRY_META[country];

  return (
    <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/90 backdrop-blur-lg dark:border-[#1d283d] dark:bg-[#081120]/90">
      <div className="app-content-container safe-top-container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-2xl border border-primary/20 bg-background-light shadow-card">
            <img
              src="/app-logo.png"
              alt="Startup News Worldwide logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Startup News
            </p>
            <h1 className="text-base font-semibold text-text-main dark:text-[#e7eefc]">
              Worldwide
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCountryClick}
            aria-label="Select region"
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-border-light bg-background-light px-3 text-sm font-semibold text-text-main transition hover:border-primary/50 dark:border-[#243147] dark:bg-[#0e1728] dark:text-[#dae7fd]"
          >
            <span aria-hidden>{flagEmoji(countryMeta.flag)}</span>
            <span>{country}</span>
            <MaterialIcon name="expand_more" className="text-[18px]" />
          </button>

          <button
            type="button"
            aria-label="Open search"
            onClick={onSearchClick}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border-light bg-background-light text-text-main transition hover:border-primary/50 hover:text-primary dark:border-[#243147] dark:bg-[#0e1728] dark:text-[#dae7fd]"
          >
            <MaterialIcon name="search" className="text-[20px]" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border-light bg-background-light text-text-main transition hover:border-primary/50 hover:text-primary dark:border-[#243147] dark:bg-[#0e1728] dark:text-[#dae7fd]"
          >
            <MaterialIcon name="notifications" className="text-[20px]" />
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
