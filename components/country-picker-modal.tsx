"use client";

import { useMemo, useState } from "react";
import { CountryCode, COUNTRY_CODES, COUNTRY_META } from "@/lib/types";
import { MaterialIcon } from "@/components/material-icon";
import { cn } from "@/lib/utils";

function flagEmoji(countryFlagCode: string): string {
  return countryFlagCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

type CountryPickerModalProps = {
  open: boolean;
  selected: CountryCode;
  onClose: () => void;
  onSelect: (country: CountryCode) => void;
};

export function CountryPickerModal({
  open,
  selected,
  onClose,
  onSelect,
}: CountryPickerModalProps): JSX.Element | null {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      return COUNTRY_CODES;
    }

    return COUNTRY_CODES.filter((country) => {
      const meta = COUNTRY_META[country];
      return (
        country.toLowerCase().includes(clean) ||
        meta.name.toLowerCase().includes(clean)
      );
    });
  }, [query]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-[#091325]/45 p-3 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Country picker"
    >
      <button
        type="button"
        aria-label="Close country picker"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border-light bg-background-light p-4 shadow-soft dark:border-[#223148] dark:bg-[#0c1424]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-main dark:text-[#e7eefc]">
            Select Region
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-light text-text-main dark:border-[#263248] dark:text-[#dbe8ff]"
          >
            <MaterialIcon name="close" className="text-[20px]" />
          </button>
        </div>

        <label className="mb-3 flex items-center gap-2 rounded-2xl border border-border-light bg-background-subtle px-3 py-2 dark:border-[#223148] dark:bg-[#111b2f]">
          <MaterialIcon name="search" className="text-text-muted dark:text-[#9ab1da]" />
          <input
            aria-label="Search country"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search country"
            className="w-full bg-transparent text-sm text-text-main outline-none placeholder:text-text-muted dark:text-[#e7eefc] dark:placeholder:text-[#8ea6cf]"
          />
        </label>

        <div className="grid max-h-[360px] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {filtered.map((country) => {
            const meta = COUNTRY_META[country];
            const isSelected = country === selected;
            return (
              <button
                key={country}
                type="button"
                onClick={() => {
                  onSelect(country);
                  onClose();
                }}
                className={cn(
                  "focus-ring flex items-center justify-between rounded-2xl border px-3 py-2 text-left transition",
                  isSelected
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border-light bg-background-light text-text-main hover:border-primary/50 dark:border-[#243147] dark:bg-[#0e1728] dark:text-[#dce8ff]"
                )}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>{flagEmoji(meta.flag)}</span>
                  <span className="text-sm font-semibold">{meta.name}</span>
                </span>
                <span className="text-xs font-medium">{country}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
