"use client";

import { Category, CATEGORY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryTabsProps = {
  categories: readonly Category[];
  active: Category;
  onChange: (category: Category) => void;
};

export function CategoryTabs({
  categories,
  active,
  onChange,
}: CategoryTabsProps): JSX.Element {
  return (
    <div className="border-b border-border-light bg-background-light dark:border-[#1d283d] dark:bg-[#081120]">
      <div className="mx-auto w-full max-w-3xl overflow-x-auto px-4 sm:px-6">
        <div className="flex min-w-max items-center gap-5">
          {categories.map((category) => {
            const isActive = active === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onChange(category)}
                className={cn(
                  "focus-ring relative py-3 text-sm font-semibold transition",
                  isActive
                    ? "text-primary"
                    : "text-text-muted hover:text-text-main dark:text-[#88a0c9] dark:hover:text-[#e7eefc]"
                )}
              >
                {CATEGORY_LABELS[category]}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-[3px] rounded-full transition-all",
                    isActive
                      ? "w-full bg-primary"
                      : "w-0 bg-transparent"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
