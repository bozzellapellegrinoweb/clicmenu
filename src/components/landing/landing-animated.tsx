"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Camera, Sparkles, QrCode, Edit3,
  Check, Star, Globe, Zap, Shield,
} from "lucide-react";
import { ClicmenuLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { MetaViewContent } from "@/components/meta-tracker";

// ── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { icon: Camera,   num: "01", title: "Scatta una foto",       description: "Fotografa il menu cartaceo o carica un PDF. Funziona con qualsiasi formato, anche HEIC da iPhone.",           color: "bg-blue-50 text-blue-600" },
  { icon: Sparkles, num: "02", title: "L'AI estrae tutto",     description: "In 10 secondi la nostra AI rileva piatti, prezzi, categorie e tag allergeni. Automaticamente.",               color: "bg-emerald-50 text-emerald-600" },
  { icon: Edit3,    num: "03", title: "Personalizza",           description: "Aggiungi foto ai piatti, modifica prezzi, riordina le sezioni. Tutto intuitivo.",                             color: "bg-violet-50 text-violet-600" },
  { icon: QrCode,   num: "04", title: "Pubblica e condividi",  description: "Il menu è online in secondi. Genera il QR code e stampalo sul tavolo. Fatto.",                               color: "bg-amber-50 text-amber-600" },
];

const FEATURES = [
  { icon: Zap,    title: "Estrazione AI istantanea", description: "La nostra AI analizza la foto e struttura l'intero menu in secondi. Nessuna digitazione manuale.", color: "from-blue-500/10 to-blue-600/5",    iconColor: "text-blue-600",    border: "border-blue-100" },
  { icon: Globe,  title: "5 lingue automatiche",     description: "I tuoi clienti internazionali leggono il menu in italiano, inglese, tedesco, francese o spagnolo.", color: "from-violet-500/10 to-violet-600/5", iconColor: "text-violet-600",  border: "border-violet-100" },
  { icon: Shield, title: "Allergeni rilevati",       description: "L'AI identifica automaticamente vegan, glutine, lattosio, piccante e altri tag. Nessun lavoro extra.", color: "from-emerald-500/10 to-emerald-600/5", iconColor: "text-emerald-600", border: "border-emerald-100" },
];

const TESTIMONIALS = [
  { quote: "Ho digitalizzato il nostro menu da 80 piatti in meno di due minuti. Incredibile. I clienti adorano poter leggere in tedesco.", name: "Marco Ferretti", role: "Ristorante Da Marco, Bolzano",     avatar: "MF", color: "bg-orange-100 text-orange-700", stars: 5 },
  { quote: "Perfetto per la nostra spa. La pagina pubblica è bellissima, elegante e si carica velocissimo sul telefono.",                  name: "Giulia Rossi",   role: "Terme di Riviera, Rimini",         avatar: "GR", color: "bg-pink-100 text-pink-700",    stars: 5 },
  { quote: "€37 l'anno è una follia. Il QR code sul tavolo e il menu sempre aggiornato. Vale 10 volte tanto.",                            name: "Antonio Bello",  role: "Pizzeria Bella Napoli, Milano",    avatar: "AB", color: "bg-emerald-100 text-emerald-700", stars: 5 },
];

const PLAN_FEATURES = [
  "Menu digitali illimitati", "Estrazione AI dalla foto o PDF", "Pagina pubblica + QR code",
  "Foto per ogni piatto", "Tag allergeni automatici", "Traduzione in 5 lingue",
  "Aggiornamenti illimitati", "Supporto via email",
];

const PREVIEW_ITEMS = [
  { name: "Margherita",       price: "€8,00",  desc: "Pomodoro, mozzarella fior di latte, basilico", tags: ["🌿 Veg"] },
  { name: "Diavola",          price: "€10,00", desc: "Pomodoro, mozzarella, salame piccante",         tags: ["🌶️ Piccante"] },
  { name: "Quattro Formaggi", price: "€11,00", desc: "Gorgonzola, provola, parmigiano, brie",         tags: [] },
];

const MARQUEE_ITEMS = ["🍽️ Ristoranti", "🍕 Pizzerie", "☕ Caffè & Bar", "🍸 Cocktail Bar", "💆 Spa & Wellness", "🏨 Hotel", "🍦 Gelaterie", "🥗 Poke Bowl", "🍣 Sushi", "🥐 Bakery"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return <span ref={ref}>{value}{suffix}</span>;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LandingAnimated() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <MetaViewContent contentName="Landing Page Clicmenu.ai" />

      {/* ── Navbar ─────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 glass-strong border-b border-white/50"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <ClicmenuLogo height={100} />
          <div className="flex items-center gap-1.5">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm px-3">Accedi</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="text-sm px-3 whitespace-nowrap">
                Inizia gratis <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="gradient-hero">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-8 uppercase tracking-wide"
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full dot-pulse" />
                Menu digitale intelligente · AI-powered
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.08] tracking-tight mb-6"
              >
                Il tuo menu digitale{" "}
                <span className="text-gradient">in 10 secondi</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.32 }}
                className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg"
              >
                Scatta una foto al menu cartaceo. L&apos;AI estrae piatti, prezzi e allergeni. Pagina pubblica + QR code pronti all&apos;istante.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.44 }}
                className="flex flex-col sm:flex-row gap-3 mb-8"
              >
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-emerald-500/25">
                    Inizia gratis — 14 giorni <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#come-funziona">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">Come funziona</Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-5 text-sm text-slate-400"
              >
                {["Nessuna carta di credito", "Setup in 2 minuti", "€37/anno tutto incluso"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />{t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: mockup */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Floating badge top */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -top-4 left-0 lg:-left-6 z-10 bg-white rounded-2xl shadow-float px-4 py-3 flex items-center gap-3 border border-slate-100 animate-float"
              >
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">AI ha estratto</p>
                  <p className="text-xs text-emerald-600 font-medium">29 piatti in 8 sec</p>
                </div>
              </motion.div>

              {/* Main card */}
              <motion.div
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-3xl shadow-float border border-slate-100/80 overflow-hidden w-full max-w-sm"
              >
                <div className="bg-gradient-to-b from-emerald-50 to-white px-5 pt-6 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-500/30 text-xl">🍕</div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Pizzeria Da Mario</h3>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><span>📍</span> Via Roma 1, Milano</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">Pizze Classiche</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">Bevande</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">Dessert</span>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-4">
                  {PREVIEW_ITEMS.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.12, duration: 0.4 }}
                      className="flex justify-between items-start gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                        {item.tags.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {item.tags.map((t) => (
                              <span key={t} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-emerald-600 flex-shrink-0 mt-0.5">{item.price}</span>
                    </motion.div>
                  ))}
                  <div className="h-px bg-slate-50" />
                  <p className="text-xs text-slate-300 text-center">+ 26 altri piatti</p>
                </div>
              </motion.div>

              {/* Floating badge bottom */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-4 right-0 lg:-right-4 z-10 bg-white rounded-2xl shadow-float px-4 py-3 flex items-center gap-3 border border-slate-100"
                style={{ animationDelay: "1s" }}
              >
                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">QR code pronto</p>
                  <p className="text-xs text-slate-400">Pronto da stampare</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-5 overflow-hidden">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-0">
          <div className="flex gap-0" style={{ display: "flex" }}>
            {[0, 1].map((rep) => (
              <motion.div
                key={rep}
                className="flex items-center gap-10 px-5 whitespace-nowrap"
                animate={{ x: ["0%", "-100%"] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: rep === 1 ? 0 : 0 }}
                style={{ willChange: "transform" }}
              >
                <span className="font-semibold text-slate-700 flex-shrink-0">Usato da:</span>
                {MARQUEE_ITEMS.map((t) => (
                  <span key={t} className="font-medium flex-shrink-0">{t}</span>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats row ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { value: 2,  suffix: " min",    label: "Setup medio" },
            { value: 5,  suffix: " lingue", label: "Traduzione auto" },
            { value: 37, suffix: "€/anno",  label: "Tutto incluso" },
          ].map((stat) => (
            <FadeUp key={stat.label}>
              <div className="flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-3 px-6 py-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-slate-400 text-sm font-medium sm:hidden">{stat.label}</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="hidden sm:block text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Come funziona ───────────────────────────────── */}
      <section id="come-funziona" className="max-w-6xl mx-auto px-4 py-28">
        <FadeUp className="text-center mb-16">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">Come funziona</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Da foto a menu online.<br />
            <span className="text-gradient">In meno di un minuto.</span>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step, i) => (
            <FadeUp key={step.num} delay={i * 0.1}>
              <div className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent z-0" style={{ width: "calc(100% - 2rem)", left: "calc(100% - 1rem)" }} />
                )}
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-100 transition-colors relative z-10"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${step.color}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-slate-100">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </motion.div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="gradient-hero py-24">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp className="text-center mb-14">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">Funzionalità</p>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Tutto quello che serve.<br />Niente di superfluo.</h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.12}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`bg-gradient-to-br ${f.color} rounded-2xl p-6 border ${f.border} h-full`}
                >
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm">
                    <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-28">
        <FadeUp className="text-center mb-14">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">Testimonianze</p>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">I nostri clienti parlano chiaro</h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.06, type: "spring" }}>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-xs font-bold`}>{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────── */}
      <section id="prezzi" className="gradient-hero py-28">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp className="text-center mb-14">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">Prezzi</p>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Un prezzo. Tutto incluso.</h2>
            <p className="text-lg text-slate-500 mt-3">Meno di un caffè al mese. Davvero.</p>
          </FadeUp>

          <div className="max-w-md mx-auto">
            <FadeUp>
              <motion.div
                whileHover={{ scale: 1.015 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative bg-white rounded-3xl card-glow border border-emerald-100/60 overflow-hidden"
              >
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400" />
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-500/30">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                      <span className="font-bold text-slate-900 text-lg">Piano Pro</span>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">Più popolare</span>
                  </div>
                  <div className="mb-7">
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-black text-slate-900 tracking-tight">€37</span>
                      <span className="text-slate-400 mb-2 text-lg">/anno</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">≈ €3,08 al mese · IVA esclusa</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {PLAN_FEATURES.map((f, i) => (
                      <motion.li
                        key={f}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3 text-sm text-slate-700"
                      >
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        {f}
                      </motion.li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full shadow-lg shadow-emerald-500/25" size="lg">
                      Inizia — 14 giorni gratis <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <p className="text-xs text-slate-400 text-center mt-3">Nessuna carta richiesta per il trial</p>
                </div>
              </motion.div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)" }}>
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-semibold mb-8 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full dot-pulse" />
              Setup in 2 minuti
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Il tuo menu digitale ti aspetta.<br />
              <span className="text-emerald-300">Gratis per 14 giorni.</span>
            </h2>
            <p className="text-emerald-100/80 text-base mb-10 max-w-md mx-auto leading-relaxed">
              Nessuna carta di credito. Nessun contratto. Smetti quando vuoi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-8 py-4 rounded-2xl text-base transition-colors shadow-xl shadow-black/20 hover:bg-emerald-50"
                >
                  Inizia gratis ora <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="#come-funziona">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-8 py-4 rounded-2xl text-base transition-colors"
                >
                  Vedi come funziona
                </motion.button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-emerald-200/70">
              {["Nessuna carta richiesta", "€37/anno dopo il trial", "Cancella in qualsiasi momento"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-300" />{t}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <ClicmenuLogo height={100} />
          <p className="text-sm text-slate-400">© 2026 Clicmenu.ai. Tutti i diritti riservati.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700 transition-colors">Termini</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
