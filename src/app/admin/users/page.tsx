import { getSupabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Utenti — Admin Clicmenu.ai" };

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trialing: "bg-orange-100 text-orange-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-slate-100 text-slate-600",
};

const statusLabel: Record<string, string> = {
  active: "Attivo",
  trialing: "Trial",
  past_due: "Scaduto",
  canceled: "Annullato",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const db = getSupabaseAdmin();

  const { data: { users: authUsers } } = await db.auth.admin.listUsers({ perPage: 500 });
  const { data: businesses } = await db.from("businesses").select("id, name, slug, type, user_id, created_at");
  const { data: subscriptions } = await db.from("subscriptions").select("user_id, status, expires_at");

  const bizByUserId = Object.fromEntries((businesses ?? []).map((b) => [b.user_id, b]));
  const subByUserId = Object.fromEntries((subscriptions ?? []).map((s) => [s.user_id, s]));

  const now = Date.now();

  let rows = authUsers
    .filter((u) => u.email !== "info@clicmenu.ai")
    .map((u) => ({
      id: u.id,
      email: u.email ?? "—",
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
      business: bizByUserId[u.id],
      subscription: subByUserId[u.id],
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter
  if (q) {
    const ql = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.email.toLowerCase().includes(ql) ||
        r.business?.name?.toLowerCase().includes(ql) ||
        r.business?.slug?.toLowerCase().includes(ql)
    );
  }
  if (status) {
    rows = rows.filter((r) => r.subscription?.status === status);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utenti</h1>
          <p className="text-slate-500 mt-1">{rows.length} utenti</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cerca email, attività, slug..."
          className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
        >
          <option value="">Tutti gli stati</option>
          <option value="active">Attivi</option>
          <option value="trialing">Trial</option>
          <option value="past_due">Past due</option>
          <option value="canceled">Annullati</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors">
          Filtra
        </button>
        {(q || status) && (
          <a href="/admin/users" className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
            Reset
          </a>
        )}
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Attività</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Stato</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Scadenza trial</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Registrazione</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Ultimo accesso</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const trialDays = row.subscription?.expires_at && row.subscription.status === "trialing"
                  ? Math.ceil((new Date(row.subscription.expires_at).getTime() - now) / (1000 * 60 * 60 * 24))
                  : null;
                const isExpiringSoon = trialDays !== null && trialDays <= 3 && trialDays >= 0;
                return (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-700 text-xs">{row.email}</td>
                    <td className="px-6 py-3">
                      {row.business ? (
                        <a href={`https://${row.business.slug}.clicmenu.ai`} target="_blank"
                          className="text-emerald-600 hover:underline text-sm font-medium">
                          {row.business.name}
                        </a>
                      ) : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-3">
                      {row.subscription ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[row.subscription.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {statusLabel[row.subscription.status] ?? row.subscription.status}
                        </span>
                      ) : <span className="text-slate-400 text-xs">nessuno</span>}
                    </td>
                    <td className="px-6 py-3">
                      {trialDays !== null ? (
                        <span className={`text-xs font-medium ${isExpiringSoon ? "text-red-600" : "text-slate-500"}`}>
                          {trialDays <= 0 ? "Scaduto" : `${trialDays}gg`}
                          {isExpiringSoon && " ⚠"}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      {new Date(row.createdAt).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      {row.lastSignIn ? new Date(row.lastSignIn).toLocaleDateString("it-IT") : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/admin/users/${row.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors">
                        Gestisci
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">Nessun utente trovato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
