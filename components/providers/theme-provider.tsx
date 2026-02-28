"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { ThemePreference } from "@/lib/types";
import {
  getStoredTheme,
  setStoredTheme,
  STORAGE_SYNC_EVENT,
  storageKeys,
  StorageSyncEventDetail,
} from "@/lib/storage";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveTheme(theme: ThemePreference): ResolvedTheme {
  if (theme === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    return "light";
  }

  return theme;
}

function applyTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }: PropsWithChildren): JSX.Element {
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const initialTheme = getStoredTheme();
    setTheme(initialTheme);
    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  useEffect(() => {
    const nextResolved = resolveTheme(theme);
    setResolvedTheme(nextResolved);
    applyTheme(nextResolved);
    setStoredTheme(theme);

    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (): void => {
      const updated = media.matches ? "dark" : "light";
      setResolvedTheme(updated);
      applyTheme(updated);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  useEffect(() => {
    const handleStorageSync = (event: Event): void => {
      const customEvent = event as CustomEvent<StorageSyncEventDetail>;
      const detail = customEvent.detail;
      if (!detail?.keys.includes(storageKeys.theme)) {
        return;
      }

      const nextTheme = getStoredTheme();
      setTheme((current) => (current === nextTheme ? current : nextTheme));
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
    };
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      resolvedTheme,
      setTheme,
      cycleTheme: () => {
        setTheme((current) => {
          if (current === "light") {
            return "dark";
          }
          if (current === "dark") {
            return "system";
          }
          return "light";
        });
      },
    };
  }, [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
