import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserActions } from "./user-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dettaglio Utente — Admin Clicmenu.ai" };

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trialing: "bg-orange-100 text-orange-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-slate-100 text-slate-600",
};

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getSupabaseAdmin();

  const [
    { data: { user: authUser } },
    { data: business },
    { data: subscription },
  ] = await Promise.all([
    db.auth.admin.getUserById(id),
    db.from("businesses").select("*").eq("user_id", id).single(),
    db.from("subscriptions").select("*").eq("user_id", id).single(),
  ]);

  if (!authUser) notFound();

  const { data: userMenus } = business
    ? await db.from("menus").select("id, name, is_published, created_at").eq("business_id", business.id).order("created_at", { ascending: false })
    : { data: [] };

  const trialDaysLeft = subscription?.expires_at && subscription.status === "trialing"
    ? Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/users" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Torna agli utenti
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{authUser.email}</h1>
        <p className="text-slate-500 mt-1 font-mono text-xs">{authUser.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          {/* Account info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Informazioni account</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{authUser.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Registrazione</dt>
                <dd className="text-slate-700">{new Date(authUser.created_at).toLocaleString("it-IT")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Ultimo accesso</dt>
                <dd className="text-slate-700">
                  {authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString("it-IT") : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Email confermata</dt>
                <dd>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${authUser.email_confirmed_at ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {authUser.email_confirmed_at ? "Sì" : "No"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Business info */}
          {business && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Attività</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Nome</dt>
                  <dd className="font-medium text-slate-900">{business.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Tipo</dt>
                  <dd className="text-slate-700 capitalize">{business.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">URL pubblico</dt>
                  <dd>
                    <a href={`https://${business.slug}.clicmenu.ai`} target="_blank" className="text-emerald-600 hover:underline font-mono text-xs">
                      {business.slug}.clicmenu.ai
                    </a>
                  </dd>
                </div>
                {business.address && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Indirizzo</dt>
                    <dd className="text-slate-700">{business.address}</dd>
                  </div>
                )}
                {business.phone && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Telefono</dt>
                    <dd className="text-slate-700">{business.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Menus */}
          {(userMenus ?? []).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Menu ({userMenus?.length})</h2>
              <div className="space-y-2">
                {userMenus?.map((menu) => (
                  <div key={menu.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm font-medium text-slate-900">{menu.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${menu.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {menu.is_published ? "Pubblicato" : "Bozza"}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(menu.created_at).toLocaleDateString("it-IT")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: subscription + actions */}
        <div className="space-y-6">

          {/* Subscription */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Abbonamento</h2>
            {subscription ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500">Stato</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[subscription.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {subscription.status}
                    </span>
                  </dd>
                </div>
                {subscription.expires_at && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Scadenza</dt>
                    <dd className="text-slate-700">{new Date(subscription.expires_at).toLocaleDateString("it-IT")}</dd>
                  </div>
                )}
                {trialDaysLeft !== null && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Giorni rimasti</dt>
                    <dd className={`font-medium ${trialDaysLeft <= 3 ? "text-red-600" : "text-slate-700"}`}>
                      {trialDaysLeft <= 0 ? "Scaduto" : `${trialDaysLeft} giorni`}
                    </dd>
                  </div>
                )}
                {subscription.stripe_customer_id && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Stripe ID</dt>
                    <dd className="font-mono text-xs text-slate-500">{subscription.stripe_customer_id}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-slate-400">Nessun abbonamento</p>
            )}
          </div>

          <UserActions
            userId={id}
            userEmail={authUser.email ?? ""}
            currentStatus={subscription?.status}
            expiresAt={subscription?.expires_at ?? null}
          />
        </div>
      </div>
    </div>
  );
}
