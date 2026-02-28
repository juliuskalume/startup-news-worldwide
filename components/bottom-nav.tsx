"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/components/material-icon";
import { cn } from "@/lib/utils";

const NAV_AUTO_HIDE_MS = 3000;

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/saved", label: "Saved", icon: "bookmark" },
  { href: "/region", label: "Region", icon: "public" },
  { href: "/profile", label: "Profile", icon: "person" },
] as const;

export function BottomNav(): JSX.Element {
  const pathname = usePathname();
  const [hidden, setHidden] = useState<boolean>(false);
  const inactivityTimeoutRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number>(0);

  const clearInactivityTimer = useCallback((): void => {
    if (inactivityTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(inactivityTimeoutRef.current);
    inactivityTimeoutRef.current = null;
  }, []);

  const scheduleInactivityHide = useCallback((): void => {
    clearInactivityTimer();
    inactivityTimeoutRef.current = window.setTimeout(() => {
      setHidden(true);
    }, NAV_AUTO_HIDE_MS);
  }, [clearInactivityTimer]);

  const showAndScheduleHide = useCallback((): void => {
    setHidden(false);
    scheduleInactivityHide();
  }, [scheduleInactivityHide]);

  useEffect(() => {
    showAndScheduleHide();
  }, [pathname, showAndScheduleHide]);

  useEffect(() => {
    lastScrollYRef.current =
      window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    const handleUserActivity = (): void => {
      showAndScheduleHide();
    };

    const handleScroll = (): void => {
      const currentScrollY =
        window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const delta = currentScrollY - lastScrollYRef.current;

      if (delta > 2) {
        setHidden(true);
        clearInactivityTimer();
      } else if (delta < -2) {
        showAndScheduleHide();
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleUserActivity, { passive: true });
    window.addEventListener("pointerdown", handleUserActivity, { passive: true });
    window.addEventListener("keydown", handleUserActivity);

    return () => {
      clearInactivityTimer();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("pointerdown", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, [clearInactivityTimer, showAndScheduleHide]);

  return (
    <nav
      className={cn(
        "safe-bottom-nav fixed inset-x-0 bottom-0 z-40 px-3 transition-all duration-300 lg:px-5",
        hidden ? "pointer-events-none translate-y-[120%] opacity-0" : "translate-y-0 opacity-100"
      )}
    >
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
