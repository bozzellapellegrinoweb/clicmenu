"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type TrackEventType = "PageView" | "ViewContent" | "CompleteRegistration" | "StartTrial";

async function sendMetaEvent(type: TrackEventType, extra?: Record<string, string>) {
  try {
    await fetch("/api/meta/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, url: window.location.pathname, ...extra }),
    });
  } catch { /* silent */ }
}

/** Traccia PageView server-side ad ogni cambio route */
export function MetaPageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    sendMetaEvent("PageView");
  }, [pathname]);
  return null;
}

/** Traccia ViewContent sulla landing page */
export function MetaViewContent({ contentName }: { contentName: string }) {
  useEffect(() => {
    sendMetaEvent("ViewContent", { contentName });
    // Anche browser-side fbq
    if (typeof window !== "undefined" && (window as unknown as { fbq?: Function }).fbq) {
      (window as unknown as { fbq: Function }).fbq("track", "ViewContent", { content_name: contentName });
    }
  }, [contentName]);
  return null;
}

/** Traccia CompleteRegistration — chiamare dopo signup */
export function trackCompleteRegistration() {
  sendMetaEvent("CompleteRegistration");
  if (typeof window !== "undefined" && (window as unknown as { fbq?: Function }).fbq) {
    (window as unknown as { fbq: Function }).fbq("track", "CompleteRegistration");
  }
}

/** Traccia StartTrial — chiamare dopo onboarding */
export function trackStartTrial() {
  sendMetaEvent("StartTrial");
  if (typeof window !== "undefined" && (window as unknown as { fbq?: Function }).fbq) {
    (window as unknown as { fbq: Function }).fbq("track", "StartTrial", { currency: "EUR", value: 37 });
  }
}
