"use client";

import { useState, useEffect } from "react";
import { X, Share, Plus, Download } from "lucide-react";

type Platform = "ios" | "android" | "desktop" | null;

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
}

export function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (localStorage.getItem("pwa-banner-dismissed")) return;

    const p = detectPlatform();
    setPlatform(p);

    if (p === "android") {
      // Listen for Android install prompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      // Show banner anyway after 3s even without prompt (Samsung, etc.)
      const t = setTimeout(() => setShow(true), 3000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(t);
      };
    }

    if (p === "ios") {
      // Show after 3 seconds on iOS
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem("pwa-banner-dismissed", "1");
  }

  async function handleAndroidInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
      else setDeferredPrompt(null);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm">
      <div
        className="rounded-3xl border border-white/50 shadow-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            {/* App icon */}
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-192.png" alt="Clicmenu.ai" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">Clicmenu.ai</p>
              <p className="text-xs text-emerald-600 font-medium">Aggiungi alla home screen</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="px-5 pb-5">
          {/* iOS instructions */}
          {platform === "ios" && (
            <>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                Installa l&apos;app per accedere ai tuoi menu sempre a portata di mano, anche offline.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Share className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">1. Tocca condividi</p>
                    <p className="text-xs text-slate-400">Il pulsante in basso nel browser Safari</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">2. &quot;Aggiungi a Home&quot;</p>
                    <p className="text-xs text-slate-400">Scorri il menu in basso e seleziona</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center mt-4">
                Funziona solo su <strong>Safari</strong> per iPhone e iPad
              </p>
            </>
          )}

          {/* Android instructions */}
          {platform === "android" && (
            <>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                Installa l&apos;app per accedere ai tuoi menu sempre a portata di mano.
              </p>
              {deferredPrompt ? (
                <button
                  onClick={handleAndroidInstall}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Installa app
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">⋮</div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">1. Tocca il menu (⋮)</p>
                      <p className="text-xs text-slate-400">In alto a destra nel browser Chrome</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">2. &quot;Aggiungi a schermata Home&quot;</p>
                      <p className="text-xs text-slate-400">Oppure &quot;Installa app&quot;</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Desktop */}
          {platform === "desktop" && (
            <>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                Installa Clicmenu.ai come app desktop per un accesso rapido.
              </p>
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Clicca l&apos;icona di installazione</p>
                  <p className="text-xs text-slate-400">Nella barra degli indirizzi del browser</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
