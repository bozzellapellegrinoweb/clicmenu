import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, BookOpen, QrCode, Eye, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: business }, { data: subscription }] = await Promise.all([
    supabase.from("businesses").select("*").eq("user_id", user!.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user!.id).single(),
  ]);

  const { data: menus } = await supabase
    .from("menus")
    .select("*, categories(count)")
    .eq("business_id", business?.id)
    .order("created_at", { ascending: false });

  const publishedCount = menus?.filter((m) => m.is_published).length ?? 0;
  const totalMenus = menus?.length ?? 0;

  const isTrialing = subscription?.status === "trialing";
  const trialDaysLeft = subscription?.expires_at
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Ciao, {business?.name} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Ecco una panoramica della tua attività</p>
        </div>
        <Link href="/dashboard/menus/new">
          <Button className="shadow-sm shadow-emerald-500/20">
            <Plus className="w-4 h-4" />
            Nuovo menu
          </Button>
        </Link>
      </div>

      {/* ── Trial banner ────────────────────────────────── */}
      {isTrialing && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl px-6 py-5 flex items-center justify-between">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-white/5 rounded-l-full" />
          <div className="absolute right-16 top-0 bottom-0 w-24 bg-white/5 rounded-full" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Periodo di prova — {trialDaysLeft} giorni rimanenti
              </p>
              <p className="text-xs text-emerald-100 mt-0.5">
                Attiva il piano Pro per continuare dopo la scadenza
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing" className="relative z-10">
            <button className="flex items-center gap-1.5 bg-white text-emerald-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm flex-shrink-0">
              Attiva piano
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      )}

      {/* ── Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total menus */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Totale</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{totalMenus}</p>
          <p className="text-sm text-slate-500 mt-1">Menu creati</p>
        </div>

        {/* Published */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Online</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{publishedCount}</p>
          <p className="text-sm text-slate-500 mt-1">Menu pubblicati</p>
        </div>

        {/* QR codes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Attivi</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{publishedCount}</p>
          <p className="text-sm text-slate-500 mt-1">QR code attivi</p>
        </div>
      </div>

      {/* ── Menu list ───────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">I tuoi menu</h2>
          {menus && menus.length > 0 && (
            <Link href="/dashboard/menus" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              Vedi tutti
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {!menus || menus.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Nessun menu ancora</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
              Crea il tuo primo menu digitale in secondi scattando una foto al menu cartaceo.
            </p>
            <Link href="/dashboard/menus/new">
              <Button>
                <Plus className="w-4 h-4" />
                Crea il primo menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {menus.slice(0, 5).map((menu) => (
              <Link key={menu.id} href={`/dashboard/menus/${menu.id}`}>
                <div className="bg-white flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{menu.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Creato il {new Date(menu.created_at).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={menu.is_published ? "emerald" : "slate"}>
                      {menu.is_published ? "Pubblicato" : "Bozza"}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick actions ────────────────────────────────── */}
      {totalMenus > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
          <h3 className="font-bold mb-1">Pronto per il tuo locale?</h3>
          <p className="text-sm text-slate-400 mb-5">Scarica il QR code e stampalo sul tavolo.</p>
          <Link href="/dashboard/menus">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors border border-white/10">
              <QrCode className="w-4 h-4" />
              Vai ai menu e scarica QR
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
