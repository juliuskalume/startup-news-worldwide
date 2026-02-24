"use client";

import { type PropsWithChildren, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";

const ICON_CLICK_SELECTOR = [
  "button",
  "a",
  "summary",
  "[role='button']",
  "[data-haptic='true']",
].join(",");

const MIN_GAP_MS = 40;

export function HapticsProvider({ children }: PropsWithChildren): JSX.Element {
  const isNative = Capacitor.isNativePlatform();
  const lastHapticAtRef = useRef<number>(0);

  useEffect(() => {
    if (!isNative) {
      return;
    }

    const onClick = (event: MouseEvent): void => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const interactive = target.closest(ICON_CLICK_SELECTOR);
      if (!interactive) {
        return;
      }

      const hasIcon =
        interactive.matches("[data-haptic='true']") ||
        interactive.classList.contains("material-symbols-outlined") ||
        interactive.querySelector(".material-symbols-outlined") !== null;

      if (!hasIcon) {
        return;
      }

      const now = Date.now();
      if (now - lastHapticAtRef.current < MIN_GAP_MS) {
        return;
      }
      lastHapticAtRef.current = now;

      void Haptics.selectionChanged().catch(() => undefined);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, [isNative]);

  return <>{children}</>;
}
