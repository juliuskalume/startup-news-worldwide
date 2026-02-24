"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PropsWithChildren,
} from "react";
import { Capacitor } from "@capacitor/core";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavigationLoaderContextValue = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  handleArticleClick: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const NavigationLoaderContext = createContext<
  NavigationLoaderContextValue | undefined
>(undefined);

const MAX_SPINNER_MS = 12_000;

function NavigationLoadingOverlay({
  show,
}: {
  show: boolean;
}): JSX.Element {
  return (
    <div
      aria-live="polite"
      aria-label="Loading article"
      className={cn(
        "fixed inset-0 z-[95] flex items-center justify-center bg-[#07101d]/36 backdrop-blur-[1.5px] transition-opacity duration-200",
        show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="inline-flex items-center gap-2 rounded-2xl border border-[#24416a] bg-[#0b1627]/95 px-4 py-2 text-sm font-semibold text-[#e7efff] shadow-soft">
        <span className="spinner-ring" />
        <span>Opening article...</span>
      </div>
    </div>
  );
}

export function NavigationLoaderProvider({
  children,
}: PropsWithChildren): JSX.Element {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);
  const lastRouteRef = useRef<string>("");
  const isNative = Capacitor.isNativePlatform();

  const stopLoading = useCallback((): void => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const startLoading = useCallback((): void => {
    if (!isNative) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsLoading(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      timeoutRef.current = null;
    }, MAX_SPINNER_MS);
  }, [isNative]);

  useEffect(() => {
    const nextRoute = pathname;
    if (!lastRouteRef.current) {
      lastRouteRef.current = nextRoute;
      return;
    }

    if (lastRouteRef.current !== nextRoute) {
      lastRouteRef.current = nextRoute;
      window.setTimeout(stopLoading, 120);
    }
  }, [pathname, stopLoading]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleArticleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>): void => {
      if (!isNative) {
        return;
      }

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      startLoading();
    },
    [isNative, startLoading]
  );

  const value = useMemo<NavigationLoaderContextValue>(
    () => ({
      isLoading,
      startLoading,
      stopLoading,
      handleArticleClick,
    }),
    [handleArticleClick, isLoading, startLoading, stopLoading]
  );

  return (
    <NavigationLoaderContext.Provider value={value}>
      {children}
      {isNative ? <NavigationLoadingOverlay show={isLoading} /> : null}
    </NavigationLoaderContext.Provider>
  );
}

export function useNavigationLoader(): NavigationLoaderContextValue {
  const context = useContext(NavigationLoaderContext);
  if (!context) {
    throw new Error(
      "useNavigationLoader must be used inside NavigationLoaderProvider"
    );
  }

  return context;
}
