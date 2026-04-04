"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Sparkles, Phone, MapPin, X, Star, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TagBadge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Business, Item } from "@/types";

interface MenuData {
  id: string;
  name: string;
  categories: {
    id: string;
    name: string;
    description: string | null;
    items: Item[];
  }[];
}

interface Props {
  business: Business & { brand_color?: string | null; google_review_url?: string | null };
  menus: MenuData[];
}

const LANGUAGES = [
  { code: "it", flag: "🇮🇹", label: "IT" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "de", flag: "🇩🇪", label: "DE" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "es", flag: "🇪🇸", label: "ES" },
];

type TranslatedMenuData = MenuData;

export function PublicMenuView({ business, menus }: Props) {
  const brand = business.brand_color || "#10b981";

  const [activeMenuId, setActiveMenuId] = useState(menus[0]?.id);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState("it");
  const [translating, setTranslating] = useState(false);
  const [translatedMenus, setTranslatedMenus] = useState<Record<string, TranslatedMenuData[]>>({ it: menus });
  const [headerVisible, setHeaderVisible] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const activeMenus = translatedMenus[currentLang] ?? menus;
  const activeMenu = activeMenus.find((m) => m.id === activeMenuId) ?? activeMenus[0];

  // Track menu view
  useEffect(() => {
    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: business.id }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setLightbox(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Compact header trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setHeaderVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // First category active
  useEffect(() => {
    if (activeMenu?.categories?.[0]) setActiveCatId(activeMenu.categories[0].id);
  }, [activeMenu]);

  const switchLang = useCallback(async (lang: string) => {
    if (lang === currentLang) return;
    if (translatedMenus[lang]) { setCurrentLang(lang); return; }
    setTranslating(true);
    try {
      const content = {
        categories: menus.flatMap((m) =>
          m.categories.map((c) => ({
            name: c.name,
            items: c.items.map((i) => ({ name: i.name, description: i.description })),
          }))
        ),
      };
      const res = await fetch("/api/menu/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, targetLang: lang }),
      });
      const { content: translated } = await res.json();
      let catIndex = 0;
      const translatedMenuList: TranslatedMenuData[] = menus.map((menu) => ({
        ...menu,
        categories: menu.categories.map((cat) => {
          const translatedCat = translated.categories[catIndex++];
          return {
            ...cat,
            name: translatedCat?.name ?? cat.name,
            items: cat.items.map((item, idx) => ({
              ...item,
              name: translatedCat?.items[idx]?.name ?? item.name,
              description: translatedCat?.items[idx]?.description ?? item.description,
            })),
          };
        }),
      }));
      setTranslatedMenus((prev) => ({ ...prev, [lang]: translatedMenuList }));
      setCurrentLang(lang);
    } catch { /* silenzioso */ }
    finally { setTranslating(false); }
  }, [currentLang, menus, translatedMenus]);

  function scrollToCategory(catId: string) {
    setActiveCatId(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) {
      const offset = headerVisible ? 56 + 52 : 52;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-screen relative" style={{ background: "#f0f0f8" }}>
      {/* ── Sfondo blob iOS-style (fixed, scorre con la pagina ma rimane dietro) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Blob 1 — brand color, top-left */}
        <div className="absolute rounded-full"
          style={{ width: 340, height: 340, top: -80, left: -60, backgroundColor: brand, opacity: 0.22, filter: "blur(80px)" }} />
        {/* Blob 2 — brand color lighter, top-right */}
        <div className="absolute rounded-full"
          style={{ width: 260, height: 260, top: 60, right: -40, backgroundColor: brand, opacity: 0.14, filter: "blur(60px)" }} />
        {/* Blob 3 — white-ish, center */}
        <div className="absolute rounded-full"
          style={{ width: 400, height: 300, top: "35%", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ffffff", opacity: 0.55, filter: "blur(80px)" }} />
        {/* Blob 4 — brand accent, bottom */}
        <div className="absolute rounded-full"
          style={{ width: 300, height: 300, bottom: -60, right: 20, backgroundColor: brand, opacity: 0.12, filter: "blur(70px)" }} />
      </div>
      {/* All content above blobs */}
      <div className="relative" style={{ zIndex: 1 }}>

      {/* ── Lightbox ──────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", backgroundColor: "rgba(0,0,0,0.60)" }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 48, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 48, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.34, 1.4, 0.64, 1] }}
              className="relative w-full sm:max-w-sm mx-4 mb-4 sm:mb-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightbox.url} alt={lightbox.name} className="w-full rounded-3xl object-cover shadow-2xl" style={{ maxHeight: "78vh" }} />
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-14 rounded-b-3xl" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)" }}>
                <p className="text-white font-bold text-xl">{lightbox.name}</p>
              </div>
              <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.40)", backdropFilter: "blur(12px)" }}>
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticky compact header ─────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-white/50 ${headerVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
        style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {business.logo_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={business.logo_url} alt={business.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
              : <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: brand }}><Sparkles className="w-4 h-4 text-white" /></div>
            }
            <span className="font-bold text-slate-900 text-base truncate">{business.name}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {LANGUAGES.map((lang) => (
              <button key={lang.code} onClick={() => switchLang(lang.code)} disabled={translating}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${currentLang === lang.code ? "text-white" : "text-slate-400 hover:text-slate-600"}`}
                style={currentLang === lang.code ? { backgroundColor: brand } : {}}
              >
                {lang.flag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────── */}
      <div ref={heroRef} className="max-w-2xl mx-auto px-4 pt-6 pb-4">
        <div
          className="rounded-3xl border border-white/70 px-5 py-5"
          style={{
            background: "rgba(255,255,255,0.68)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: `0 4px 32px ${brand}18`,
          }}
        >
          {/* Row 1: logo + name + info */}
          <div className="flex items-center gap-4 mb-4">
            {business.logo_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={business.logo_url} alt={business.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-sm border border-white/60" />
              : <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm" style={{ backgroundColor: brand }}><Sparkles className="w-7 h-7 text-white" /></div>
            }
            <div className="min-w-0 flex-1">
              <h1 className="font-black text-slate-900 text-2xl leading-tight">{business.name}</h1>
              <div className="flex flex-col gap-0.5 mt-1">
                {business.address && (
                  <p className="text-sm text-slate-400 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />{business.address}
                  </p>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="text-sm flex items-center gap-1 font-semibold" style={{ color: brand }}>
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />{business.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: language pills */}
          <div className="flex items-center gap-1.5 pt-3.5 border-t border-slate-100/80">
            <span className="text-xs text-slate-400 mr-1">Lingua:</span>
            {LANGUAGES.map((lang) => {
              const active = currentLang === lang.code;
              return (
                <button key={lang.code} onClick={() => switchLang(lang.code)} disabled={translating}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-all disabled:opacity-40"
                  style={active ? { backgroundColor: brand, color: "#fff" } : { backgroundColor: "rgba(0,0,0,0.06)", color: "#64748b" }}
                >
                  <span>{lang.flag}</span>
                  {active && <span>{lang.label}</span>}
                </button>
              );
            })}
            {translating && <div className="ml-auto w-4 h-4 border-2 border-slate-200 rounded-full animate-spin" style={{ borderTopColor: brand }} />}
          </div>
        </div>
      </div>

      {/* ── Menu tabs ────────────────────────────────── */}
      {activeMenus.length > 1 && (
        <div
          className="sticky z-30 border-b border-white/50 transition-[top] duration-300"
          style={{
            top: headerVisible ? "56px" : "0px",
            background: "rgba(255,255,255,0.80)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <div className="max-w-2xl mx-auto px-4 flex gap-0 overflow-x-auto no-scrollbar">
            {activeMenus.map((menu) => (
              <button key={menu.id} onClick={() => setActiveMenuId(menu.id)}
                className="flex-shrink-0 px-5 py-3.5 text-base font-semibold border-b-2 whitespace-nowrap transition-all"
                style={menu.id === activeMenuId ? { color: brand, borderColor: brand } : { color: "#94a3b8", borderColor: "transparent" }}
              >
                {menu.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Category nav ─────────────────────────────── */}
      {activeMenu && activeMenu.categories.length > 1 && (
        <div
          className="sticky z-30 border-b border-white/40 transition-[top] duration-300"
          style={{
            top: headerVisible
              ? activeMenus.length > 1 ? "105px" : "56px"
              : activeMenus.length > 1 ? "49px" : "0px",
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-3">
              {activeMenu.categories.map((cat) => {
                const isActive = activeCatId === cat.id;
                return (
                  <button key={cat.id} onClick={() => scrollToCategory(cat.id)}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap"
                    style={isActive ? { backgroundColor: brand, color: "#fff" } : { backgroundColor: "rgba(0,0,0,0.07)", color: "#475569" }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Items ────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {activeMenu && (
            <motion.div
              key={activeMenu.id + currentLang}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-5 space-y-8"
            >
              {activeMenu.categories.map((category) => {
                const availableItems = category.items.filter((i) => i.is_available);
                if (availableItems.length === 0) return null;
                return (
                  <section key={category.id} id={`cat-${category.id}`}>
                    {/* Category title */}
                    <div className="mb-4">
                      <h2 className="text-2xl font-black text-slate-900">{category.name}</h2>
                      {category.description && (
                        <p className="text-sm text-slate-400 mt-0.5">{category.description}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {availableItems.map((item) => (
                        <PublicItemCard
                          key={item.id}
                          item={item}
                          brand={brand}
                          lang={currentLang}
                          onPhotoClick={(url, name, itemId) => {
                            setLightbox({ url, name });
                            fetch("/api/analytics/click", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ itemId, businessId: business.id }),
                            }).catch(() => {});
                          }}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Google Review ─────────────────────────────── */}
      {business.google_review_url && (
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <a
            href={business.google_review_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 rounded-3xl border border-white/60 shadow-sm active:scale-[0.98] transition-transform"
            style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
          >
            <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-100">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 text-base">Come è andata?</p>
              <p className="text-sm text-slate-400 mt-0.5">Lascia una recensione su Google</p>
            </div>
            <span className="text-slate-300 text-lg">→</span>
          </a>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="text-center py-8">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
          Menu digitale con <Sparkles className="w-3 h-3" />
          <a href="/" className="hover:underline font-medium" style={{ color: brand }}>Clicmenu.ai</a>
        </p>
      </footer>
      </div>{/* end z-1 wrapper */}
    </div>
  );
}

// ── Item Card ─────────────────────────────────────────────────────────────────

function PublicItemCard({ item, brand, lang, onPhotoClick }: {
  item: Item;
  brand: string;
  lang: string;
  onPhotoClick: (url: string, name: string, itemId: string) => void;
}) {
  return (
    <div
      className="rounded-3xl border border-white/50 active:scale-[0.98] transition-transform overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Riga principale: testo sx + prezzo/foto dx ── */}
      <div className="flex">
        {/* Colonna sinistra: titolo + descrizione */}
        <div className="flex-1 min-w-0 px-4 pt-4 pb-3">
          <h3 className="font-bold text-slate-900 text-xl leading-tight mb-1.5">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-slate-400 text-sm leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

      {/* ── Colonna destra: prezzo in alto, foto in basso ── */}
      <div className="flex-shrink-0 flex flex-col items-end pt-4 pb-3 pr-3 pl-2" style={{ minWidth: 122 }}>
        {/* Prezzo — top right */}
        {item.price !== null && (
          <span className="font-black text-lg leading-none mb-4" style={{ color: brand }}>
            {formatPrice(item.price, item.currency)}
          </span>
        )}
        {/* Foto — sotto il prezzo */}
        {item.photo_url && (
          <button
            className="focus:outline-none active:opacity-90"
            style={{ width: 110, height: 110 }}
            onClick={() => onPhotoClick(item.photo_url!, item.name, item.id)}
            aria-label={`Apri foto di ${item.name}`}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.photo_url}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.40)" }}
              >
                <Maximize2 className="w-3 h-3 text-white" />
              </div>
            </div>
          </button>
        )}
      </div>
      </div>{/* fine riga principale */}

      {/* ── Riga tag: a tutta larghezza in fondo ──── */}
      {item.tags && item.tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
