import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, MousePointerClick, TrendingUp } from "lucide-react";
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

  // Analytics per questo utente (ultimi 30 giorni)
  const ago30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ago7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: views }, { data: clicks }] = business ? await Promise.all([
    db.from("menu_views").select("viewed_at").eq("business_id", business.id).gte("viewed_at", ago30),
    db.from("item_clicks").select("clicked_at").eq("business_id", business.id).gte("clicked_at", ago30),
  ]) : [{ data: [] }, { data: [] }];

  const totalViews = views?.length ?? 0;
  const views7 = (views ?? []).filter(v => v.viewed_at >= ago7).length;
  const totalClicks = clicks?.length ?? 0;

  // Visite per giorno ultimi 7
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of views ?? []) {
    const key = v.viewed_at.slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }
  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
  const maxBar = Math.max(...dailyData.map(d => d.count), 1);

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

          {/* Analytics */}
          {business && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Analytics (30 giorni)</h2>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <Eye className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-slate-900">{totalViews}</p>
                  <p className="text-xs text-slate-500">Visite tot.</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-slate-900">{views7}</p>
                  <p className="text-xs text-slate-500">Visite 7gg</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 text-center">
                  <MousePointerClick className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-slate-900">{totalClicks}</p>
                  <p className="text-xs text-slate-500">Click piatti</p>
                </div>
              </div>
              {totalViews > 0 && (
                <div className="space-y-2">
                  {dailyData.map(({ date, count }) => (
                    <div key={date} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-20 flex-shrink-0">
                        {new Date(date).toLocaleDateString("it-IT", { weekday: "short", day: "numeric" })}
                      </span>
                      <div className="flex-1 bg-slate-50 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-end pr-2"
                          style={{ width: count === 0 ? "0%" : `${Math.max((count / maxBar) * 100, 6)}%` }}
                        >
                          {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
