import { getSupabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import { Users, Store, CreditCard, Euro, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Clicmenu.ai" };

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trialing: "bg-orange-100 text-orange-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-slate-100 text-slate-600",
};

export default async function AdminPage() {
  const db = getSupabaseAdmin();

  const [
    { count: totalBusinesses },
    { count: totalMenus },
    { count: activeSubs },
    { count: trialSubs },
    { count: pastDueSubs },
    { data: allSubs },
    { data: recentBusinesses },
    { data: { users: authUsers } },
  ] = await Promise.all([
    db.from("businesses").select("*", { count: "exact", head: true }),
    db.from("menus").select("*", { count: "exact", head: true }),
    db.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    db.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
    db.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "past_due"),
    db.from("subscriptions").select("user_id, status, expires_at").eq("status", "trialing"),
    db.from("businesses")
      .select("id, name, type, slug, created_at, user_id, subscriptions(status, expires_at)")
      .order("created_at", { ascending: false })
      .limit(8),
    db.auth.admin.listUsers({ perPage: 500 }),
  ]);

  const emailById = Object.fromEntries(authUsers.map((u) => [u.id, u.email ?? "—"]));

  // Trial in scadenza entro 3 giorni
  const now = Date.now();
  const in3days = now + 3 * 24 * 60 * 60 * 1000;
  const expiringTrials = (allSubs ?? []).filter((s) => {
    if (!s.expires_at) return false;
    const t = new Date(s.expires_at).getTime();
    return t > now && t <= in3days;
  });

  // Nuovi utenti ultimi 7 giorni
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const newThisWeek = authUsers.filter((u) => u.created_at > weekAgo && u.email !== "info@clicmenu.ai").length;

  const arr = (activeSubs ?? 0) * 37;

  const stats = [
    { label: "Attività registrate", value: totalBusinesses ?? 0, icon: Store, color: "text-emerald-600 bg-emerald-50", sub: `${totalMenus ?? 0} menu totali` },
    { label: "Abbonamenti attivi", value: activeSubs ?? 0, icon: CreditCard, color: "text-blue-600 bg-blue-50", sub: `${pastDueSubs ?? 0} past due` },
    { label: "In trial", value: trialSubs ?? 0, icon: Clock, color: "text-orange-600 bg-orange-50", sub: `${expiringTrials.length} scadono in 3gg` },
    { label: "ARR stimato", value: `€${arr}`, icon: Euro, color: "text-purple-600 bg-purple-50", sub: "€37/anno × attivi" },
    { label: "Nuovi (7gg)", value: newThisWeek, icon: TrendingUp, color: "text-teal-600 bg-teal-50", sub: "nuove registrazioni" },
    { label: "Past due", value: pastDueSubs ?? 0, icon: AlertTriangle, color: "text-red-600 bg-red-50", sub: "da recuperare" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">Statistiche piattaforma Clicmenu.ai</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Trial in scadenza */}
      {expiringTrials.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-amber-900">Trial in scadenza nei prossimi 3 giorni ({expiringTrials.length})</h2>
          </div>
          <div className="space-y-2">
            {expiringTrials.map((s) => {
              const daysLeft = Math.ceil((new Date(s.expires_at!).getTime() - now) / (1000 * 60 * 60 * 24));
              return (
                <div key={s.user_id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100">
                  <span className="text-sm text-slate-700">{emailById[s.user_id] ?? s.user_id.slice(0, 8) + "…"}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${daysLeft === 0 ? "text-red-600" : "text-amber-700"}`}>
                      {daysLeft === 0 ? "Scade oggi" : `${daysLeft}gg`}
                    </span>
                    <Link href={`/admin/users/${s.user_id}`}
                      className="text-xs px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-medium transition-colors">
                      Gestisci
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ultime registrazioni */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Ultime registrazioni</h2>
          <Link href="/admin/users" className="text-sm text-emerald-600 hover:underline font-medium">Vedi tutti →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Attività</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Piano</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Registrazione</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">URL</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(recentBusinesses ?? []).map((biz) => {
                const sub = (biz.subscriptions as unknown as Array<{ status: string; expires_at: string | null }>)?.[0];
                return (
                  <tr key={biz.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">{biz.name}</td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{emailById[biz.user_id] ?? "—"}</td>
                    <td className="px-6 py-3">
                      {sub ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[sub.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {sub.status}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      {new Date(biz.created_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-6 py-3">
                      <a href={`https://${biz.slug}.clicmenu.ai`} target="_blank"
                        className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-mono hover:bg-emerald-100 transition-colors">
                        {biz.slug}.clicmenu.ai
                      </a>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/admin/users/${biz.user_id}`}
                        className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                        Dettaglio
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(recentBusinesses ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Nessuna attività registrata</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
