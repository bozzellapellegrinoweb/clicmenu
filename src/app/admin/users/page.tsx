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

export default async function AdminUsersPage() {
  // Get all auth users
  const { data: { users: authUsers } } = await getSupabaseAdmin().auth.admin.listUsers({ perPage: 500 });

  // Get all businesses + subscriptions
  const { data: businesses } = await getSupabaseAdmin()
    .from("businesses")
    .select("id, name, slug, type, user_id, created_at");

  const { data: subscriptions } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("user_id, status, trial_ends_at, current_period_end");

  // Merge
  const bizByUserId = Object.fromEntries((businesses ?? []).map((b) => [b.user_id, b]));
  const subByUserId = Object.fromEntries((subscriptions ?? []).map((s) => [s.user_id, s]));

  const rows = authUsers
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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utenti</h1>
          <p className="text-slate-500 mt-1">{rows.length} utenti registrati</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Attività</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Abbonamento</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Registrazione</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Ultimo accesso</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-900">{row.email}</td>
                  <td className="px-6 py-3">
                    {row.business ? (
                      <a href={`/m/${row.business.slug}`} target="_blank"
                        className="text-emerald-600 hover:underline text-sm">
                        {row.business.name}
                      </a>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-3">
                    {row.subscription ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[row.subscription.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {row.subscription.status}
                      </span>
                    ) : <span className="text-slate-400 text-xs">nessuno</span>}
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs">
                    {new Date(row.createdAt).toLocaleDateString("it-IT")}
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs">
                    {row.lastSignIn ? new Date(row.lastSignIn).toLocaleDateString("it-IT") : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/users/${row.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                    >
                      Gestisci
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Nessun utente</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
