"use client";

import { useMemo, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { CountryCode, COUNTRY_CODES, COUNTRY_META } from "@/lib/types";
import { getStoredCountry, setStoredCountry } from "@/lib/storage";
import { cn } from "@/lib/utils";

function flagEmoji(countryFlagCode: string): string {
  return countryFlagCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

export function RegionScreen(): JSX.Element {
  const [selected, setSelected] = useState<CountryCode>(getStoredCountry("US"));
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const clean = search.trim().toLowerCase();
    if (!clean.length) {
      return COUNTRY_CODES;
    }

    return COUNTRY_CODES.filter((country) => {
      const meta = COUNTRY_META[country];
      return (
        country.toLowerCase().includes(clean) ||
        meta.name.toLowerCase().includes(clean)
      );
    });
  }, [search]);

  return (
    <div className="relative min-h-screen pb-24">
      <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/90 backdrop-blur dark:border-[#1d283d] dark:bg-[#081120]/90">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-text-main dark:text-[#ebf2ff]">Region</h1>
          <p className="mt-1 text-sm text-text-muted dark:text-[#8fa8d2]">
            Feed region currently set to {selected}
          </p>

          <label className="mt-3 flex items-center gap-2 rounded-2xl border border-border-light bg-background-subtle px-3 py-2 dark:border-[#253247] dark:bg-[#101a2d]">
            <span className="material-symbols-outlined text-[18px] text-text-muted dark:text-[#8fa8d2]">
              search
            </span>
            <input
              aria-label="Search region"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search country"
              className="w-full bg-transparent text-sm text-text-main outline-none placeholder:text-text-muted dark:text-[#edf3ff] dark:placeholder:text-[#8fa8d2]"
            />
          </label>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((country) => {
            const meta = COUNTRY_META[country];
            const active = selected === country;

            return (
              <button
                type="button"
                key={country}
                onClick={() => {
                  setSelected(country);
                  setStoredCountry(country);
                }}
                className={cn(
                  "focus-ring rounded-3xl border px-4 py-3 text-left transition",
                  active
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border-light bg-background-light text-text-main hover:border-primary/40 dark:border-[#223148] dark:bg-[#10192c] dark:text-[#ebf2ff]"
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-lg" aria-hidden>
                    {flagEmoji(meta.flag)}
                  </span>
                  <span className="text-xs font-semibold">{country}</span>
                </div>
                <p className="text-sm font-semibold">{meta.name}</p>
              </button>
            );
          })}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
