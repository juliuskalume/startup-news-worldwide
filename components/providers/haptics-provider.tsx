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
const HAPTIC_STYLE = ImpactStyle.Light;

type AndroidHapticsBridge = {
  touchDown?: () => void;
  touchUp?: () => void;
  confirm?: () => void;
  reject?: () => void;
};

declare global {
  interface Window {
    AndroidHaptics?: AndroidHapticsBridge;
  }
}

export function HapticsProvider({ children }: PropsWithChildren): JSX.Element {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  const isAndroidNative = isNative && platform === "android";
  const shouldUseImpact = isNative && platform === "ios";
  const lastHapticAtRef = useRef<number>(0);
  const activeAndroidTouchRef = useRef<boolean>(false);

  useEffect(() => {
    if (!shouldUseImpact && !isAndroidNative) {
      return;
    }

    const triggerImpactHaptic = (): void => {
      const now = Date.now();
      if (now - lastHapticAtRef.current < MIN_GAP_MS) {
        return;
      }
      lastHapticAtRef.current = now;

      void Haptics.impact({ style: HAPTIC_STYLE }).catch(() => undefined);
    };

    const getIconInteractiveTarget = (target: EventTarget | null): HTMLElement | null => {
      const node = target as HTMLElement | null;
      if (!node) {
        return null;
      }

      const interactive = node.closest<HTMLElement>(ICON_CLICK_SELECTOR);
      if (!interactive) {
        return null;
      }

      const hasIcon =
        interactive.matches("[data-haptic='true']") ||
        interactive.classList.contains("material-symbols-outlined") ||
        interactive.querySelector(".material-symbols-outlined") !== null;

      return hasIcon ? interactive : null;
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      const interactive = getIconInteractiveTarget(event.target);
      if (!interactive) {
        return;
      }

      if (isAndroidNative && typeof window.AndroidHaptics?.touchDown === "function") {
        activeAndroidTouchRef.current = true;
        window.AndroidHaptics.touchDown();
      } else if (shouldUseImpact) {
        triggerImpactHaptic();
      }
    };

    const onPointerUpOrCancel = (): void => {
      if (!isAndroidNative || !activeAndroidTouchRef.current) {
        return;
      }

      activeAndroidTouchRef.current = false;
      if (typeof window.AndroidHaptics?.touchUp === "function") {
        window.AndroidHaptics.touchUp();
      }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || (event.key !== "Enter" && event.key !== " ")) {
        return;
      }

      const interactive = getIconInteractiveTarget(event.target);
      if (!interactive) {
        return;
      }

      if (isAndroidNative && typeof window.AndroidHaptics?.confirm === "function") {
        window.AndroidHaptics.confirm();
      } else if (shouldUseImpact) {
        triggerImpactHaptic();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUpOrCancel, true);
    document.addEventListener("pointercancel", onPointerUpOrCancel, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUpOrCancel, true);
      document.removeEventListener("pointercancel", onPointerUpOrCancel, true);
      document.removeEventListener("keydown", onKeyDown, true);
      activeAndroidTouchRef.current = false;
    };
  }, [isAndroidNative, shouldUseImpact]);

  return <>{children}</>;
}
