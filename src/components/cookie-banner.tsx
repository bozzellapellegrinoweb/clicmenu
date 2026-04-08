"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "clicmenu_consent";

function grantAll() {
  if (typeof window === "undefined" || typeof (window as any).gtag !== "function") return;
  (window as any).gtag("consent", "update", {
    ad_storage:         "granted",
    ad_user_data:       "granted",
    ad_personalization: "granted",
    analytics_storage:  "granted",
  });
}

function denyAll() {
  if (typeof window === "undefined" || typeof (window as any).gtag !== "function") return;
  (window as any).gtag("consent", "update", {
    ad_storage:         "denied",
    ad_user_data:       "denied",
    ad_personalization: "denied",
    analytics_storage:  "denied",
  });
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      setVisible(true);
    } else {
      // Ripristina il consenso salvato
      if (saved === "granted") grantAll();
    }
  }, []);

  function accept() {
    grantAll();
    localStorage.setItem(CONSENT_KEY, "granted");
    setVisible(false);
  }

  function reject() {
    denyAll();
    localStorage.setItem(CONSENT_KEY, "denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 mb-1">🍪 Utilizziamo i cookie</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Usiamo cookie analytics per migliorare il servizio. Nessun dato viene venduto.{" "}
            <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy policy</Link>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={reject}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Rifiuta
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
