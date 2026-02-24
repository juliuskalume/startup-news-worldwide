"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SESSION_KEY = "newshub_site_loader_seen";
const HIDE_ANIMATION_MS = 420;
const FALLBACK_HIDE_MS = 3200;

export function SiteLoader(): JSX.Element | null {
  const [visible, setVisible] = useState<boolean>(false);
  const [exiting, setExiting] = useState<boolean>(false);
  const hideTimeoutRef = useRef<number | null>(null);

  const closeLoader = useCallback((): void => {
    if (!visible) {
      return;
    }

    setExiting(true);
    window.setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, HIDE_ANIMATION_MS);
  }, [visible]);

  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (seen === "1") {
      return;
    }

    setVisible(true);
    hideTimeoutRef.current = window.setTimeout(closeLoader, FALLBACK_HIDE_MS);

    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [closeLoader]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-[#070f1c]/95 px-6 backdrop-blur-md transition-opacity duration-500",
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      )}
      aria-label="Site loading animation"
      role="status"
    >
      <div className="w-full max-w-sm animate-riseIn rounded-3xl border border-[#20324b] bg-[#0d1728] p-4 shadow-soft">
        <video
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={closeLoader}
          className="aspect-video w-full rounded-2xl object-cover"
        >
          <source src="/trail-loading.webm" type="video/webm" />
        </video>

        <p className="mt-3 text-center text-sm font-semibold text-[#dbe7ff]">
          Loading Startup News Worldwide...
        </p>
      </div>
    </div>
  );
}

