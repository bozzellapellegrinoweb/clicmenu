import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Abbonamenti — Admin Clicmenu.ai" };

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trialing: "bg-orange-100 text-orange-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-slate-100 text-slate-600",
};

export default async function AdminSubscriptionsPage() {
  const { data: subscriptions } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("id, user_id, status, expires_at, stripe_customer_id, created_at, businesses(name, slug, type)")
    .order("created_at", { ascending: false });

  const { data: { users: authUsers } } = await getSupabaseAdmin().auth.admin.listUsers({ perPage: 500 });
  const emailById = Object.fromEntries(authUsers.map((u) => [u.id, u.email]));

  const counts = {
    active: subscriptions?.filter((s) => s.status === "active").length ?? 0,
    trialing: subscriptions?.filter((s) => s.status === "trialing").length ?? 0,
    past_due: subscriptions?.filter((s) => s.status === "past_due").length ?? 0,
    canceled: subscriptions?.filter((s) => s.status === "canceled").length ?? 0,
  };

  const arr = counts.active * 37;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Abbonamenti</h1>
        <p className="text-slate-500 mt-1">{subscriptions?.length ?? 0} abbonamenti totali · ARR stimato: <strong>€{arr}</strong></p>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3 mb-8">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${statusColor[status]}`}>
            <span className="capitalize">{status}</span>
            <span className="font-bold">{count}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Utente</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Attività</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Stato</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Scadenza</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Creato</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Valore</th>
              </tr>
            </thead>
            <tbody>
              {(subscriptions ?? []).map((sub) => {
                const biz = sub.businesses as unknown as { name: string; slug: string; type: string } | null;
                return (
                  <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-700 text-xs">{emailById[sub.user_id] ?? sub.user_id.slice(0, 8) + "…"}</td>
                    <td className="px-6 py-3">
                      {biz ? (
                        <a href={`https://${biz.slug}.clicmenu.ai`} target="_blank" className="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                          {biz.name}
                        </a>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[sub.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("it-IT") : "—"}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      {new Date(sub.created_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-900">
                      {sub.status === "active" ? "€37/anno" : "—"}
                    </td>
                  </tr>
                );
              })}
              {(subscriptions ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Nessun abbonamento</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
