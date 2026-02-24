"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { MaterialIcon } from "@/components/material-icon";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps): JSX.Element {
  const { theme, resolvedTheme, cycleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={`Theme: ${theme}. Tap to cycle`}
      onClick={cycleTheme}
      className={cn(
        "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border-light bg-background-light text-text-main transition hover:border-primary/50 hover:text-primary dark:border-[#263247] dark:bg-[#0f1728] dark:text-[#d7e4fa]",
        className
      )}
    >
      <MaterialIcon
        name={resolvedTheme === "dark" ? "dark_mode" : "light_mode"}
        className="text-[20px]"
      />
    </button>
  );
}
