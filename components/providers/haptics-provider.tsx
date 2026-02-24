"use client";

import { type PropsWithChildren, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const ICON_CLICK_SELECTOR = [
  "button",
  "a",
  "summary",
  "[role='button']",
  "[data-haptic='true']",
].join(",");

const MIN_GAP_MS = 40;
const HAPTIC_STYLE = ImpactStyle.Medium;

export function HapticsProvider({ children }: PropsWithChildren): JSX.Element {
  const isNative = Capacitor.isNativePlatform();
  const lastHapticAtRef = useRef<number>(0);

  useEffect(() => {
    if (!isNative) {
      return;
    }

    const triggerIconHaptic = (): void => {
      const now = Date.now();
      if (now - lastHapticAtRef.current < MIN_GAP_MS) {
        return;
      }
      lastHapticAtRef.current = now;

      void Haptics.impact({ style: HAPTIC_STYLE }).catch(() => undefined);
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

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

      triggerIconHaptic();
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || (event.key !== "Enter" && event.key !== " ")) {
        return;
      }

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

      triggerIconHaptic();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isNative]);

  return <>{children}</>;
}
