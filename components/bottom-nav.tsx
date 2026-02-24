"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/saved", label: "Saved", icon: "bookmark" },
  { href: "/region", label: "Region", icon: "public" },
  { href: "/profile", label: "Profile", icon: "person" },
] as const;

export function BottomNav(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom-nav fixed inset-x-0 bottom-0 z-40 px-3 lg:px-5">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border-light bg-background-light/95 px-2 pb-2 pt-1 shadow-soft backdrop-blur dark:border-[#1d283d] dark:bg-[#081120]/95 sm:px-4">
        <ul className="grid grid-cols-5 gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "focus-ring inline-flex w-full flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                    active
                      ? "bg-primary-light text-primary dark:bg-[#112341]"
                      : "text-text-muted hover:text-text-main dark:text-[#8ea6cf] dark:hover:text-[#e6edfc]"
                  )}
                >
                  <MaterialIcon
                    name={item.icon}
                    className={cn("mb-0.5 text-[21px]", active ? "text-primary" : "")}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
