import { supabaseAdmin } from "@/lib/supabase/admin";
import { Users, Store, CreditCard, TrendingUp, Euro, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Clicmenu.ai" };

export default async function AdminPage() {
  const [
    { count: totalBusinesses },
    { count: totalMenus },
    { count: activeSubs },
    { count: trialSubs },
    { count: pastDueSubs },
    { data: recentBusinesses },
  ] = await Promise.all([
    supabaseAdmin.from("businesses").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("menus").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
    supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "past_due"),
    supabaseAdmin
      .from("businesses")
      .select("id, name, type, slug, created_at, user_id, subscriptions(status, trial_ends_at)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const arr = (activeSubs ?? 0) * 37;

  const stats = [
    { label: "Attività registrate", value: totalBusinesses ?? 0, icon: Store, color: "text-emerald-600 bg-emerald-50", sub: `${totalMenus ?? 0} menu totali` },
    { label: "Abbonamenti attivi", value: activeSubs ?? 0, icon: CreditCard, color: "text-blue-600 bg-blue-50", sub: `${pastDueSubs ?? 0} scaduti` },
    { label: "In trial", value: trialSubs ?? 0, icon: Clock, color: "text-orange-600 bg-orange-50", sub: "14 giorni gratuiti" },
    { label: "ARR stimato", value: `€${arr}`, icon: Euro, color: "text-purple-600 bg-purple-50", sub: "€37/anno × attivi" },
  ];

  const statusColor: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    trialing: "bg-orange-100 text-orange-700",
    past_due: "bg-red-100 text-red-700",
    canceled: "bg-slate-100 text-slate-600",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">Statistiche piattaforma Clicmenu.ai</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Recent signups */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Ultime registrazioni</h2>
          <a href="/admin/users" className="text-sm text-emerald-600 hover:underline font-medium">Vedi tutti →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Attività</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Tipo</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Abbonamento</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Registrazione</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Menu</th>
              </tr>
            </thead>
            <tbody>
              {(recentBusinesses ?? []).map((biz) => {
                const sub = (biz.subscriptions as unknown as Array<{ status: string; trial_ends_at: string | null }>)?.[0];
                return (
                  <tr key={biz.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">{biz.name}</td>
                    <td className="px-6 py-3 text-slate-500 capitalize">{biz.type}</td>
                    <td className="px-6 py-3">
                      {sub ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[sub.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {sub.status}
                        </span>
                      ) : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {new Date(biz.created_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-6 py-3">
                      <a href={`/m/${biz.slug}`} target="_blank"
                        className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors">
                        /m/{biz.slug}
                      </a>
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
