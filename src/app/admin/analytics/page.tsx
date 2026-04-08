import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Eye, MousePointerClick, TrendingUp, Store, BarChart2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics — Admin Clicmenu.ai" };

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}

export default async function AdminAnalyticsPage() {
  const db = getSupabaseAdmin();
  const now = new Date();
  const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ago7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: allViews },
    { data: allClicks },
    { data: businesses },
  ] = await Promise.all([
    db.from("menu_views").select("business_id, viewed_at").gte("viewed_at", ago30),
    db.from("item_clicks").select("business_id, clicked_at").gte("clicked_at", ago30),
    db.from("businesses").select("id, name, slug"),
  ]);

  const bizMap = Object.fromEntries((businesses ?? []).map((b) => [b.id, b]));

  // Totali
  const totalViews = allViews?.length ?? 0;
  const totalClicks = allClicks?.length ?? 0;
  const views7 = (allViews ?? []).filter((v) => v.viewed_at >= ago7).length;

  // Views per giorno (ultimi 14 giorni)
  const dailyMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of allViews ?? []) {
    const key = v.viewed_at.slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }
  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
  const maxBar = Math.max(...dailyData.map((d) => d.count), 1);

  // Top business per views
  const viewsByBiz: Record<string, number> = {};
  for (const v of allViews ?? []) viewsByBiz[v.business_id] = (viewsByBiz[v.business_id] ?? 0) + 1;
  const topByViews = Object.entries(viewsByBiz)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => ({ id, count, biz: bizMap[id] }));
  const maxViews = Math.max(...topByViews.map((t) => t.count), 1);

  // Top business per clicks
  const clicksByBiz: Record<string, number> = {};
  for (const c of allClicks ?? []) clicksByBiz[c.business_id] = (clicksByBiz[c.business_id] ?? 0) + 1;
  const topByClicks = Object.entries(clicksByBiz)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => ({ id, count, biz: bizMap[id] }));
  const maxClicks = Math.max(...topByClicks.map((t) => t.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics piattaforma</h1>
        <p className="text-slate-500 mt-1">Ultimi 30 giorni — tutti gli utenti</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString("it-IT")}</p>
          <p className="text-sm text-slate-500 mt-0.5">Visite menu (30gg)</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{views7.toLocaleString("it-IT")}</p>
          <p className="text-sm text-slate-500 mt-0.5">Visite ultimi 7gg</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-3">
            <MousePointerClick className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalClicks.toLocaleString("it-IT")}</p>
          <p className="text-sm text-slate-500 mt-0.5">Click piatti (30gg)</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
            <Store className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{Object.keys(viewsByBiz).length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Attività con visite</p>
        </div>
      </div>

      {/* Grafico visite 14 giorni */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Visite giornaliere — ultimi 14 giorni</h2>
        </div>
        {totalViews === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Nessuna visita ancora registrata</p>
        ) : (
          <div className="space-y-2.5">
            {dailyData.map(({ date, count }) => (
              <div key={date} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-28 flex-shrink-0">{formatDay(date)}</span>
                <div className="flex-1 bg-slate-50 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-end pr-2.5 transition-all"
                    style={{ width: count === 0 ? "0%" : `${Math.max((count / maxBar) * 100, 6)}%` }}
                  >
                    {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                  </div>
                </div>
                {count === 0 && <span className="text-xs text-slate-300 w-4">0</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top per visite */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Eye className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Top attività per visite</h2>
          </div>
          {topByViews.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Nessun dato</p>
          ) : (
            <div className="space-y-3">
              {topByViews.map(({ id, count, biz }, i) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-200 w-5 text-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/users`} className="text-sm font-semibold text-slate-900 hover:text-emerald-600 truncate block">
                      {biz?.name ?? id.slice(0, 8)}
                    </Link>
                    <div className="mt-1 bg-slate-50 rounded-full h-2">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        style={{ width: `${(count / maxViews) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-500 w-16 text-right flex-shrink-0">
                    {count.toLocaleString("it-IT")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top per click */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <MousePointerClick className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Top attività per click piatti</h2>
          </div>
          {topByClicks.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Nessun dato</p>
          ) : (
            <div className="space-y-3">
              {topByClicks.map(({ id, count, biz }, i) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-200 w-5 text-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-900 truncate block">
                      {biz?.name ?? id.slice(0, 8)}
                    </span>
                    <div className="mt-1 bg-slate-50 rounded-full h-2">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
                        style={{ width: `${(count / maxClicks) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-500 w-16 text-right flex-shrink-0">
                    {count.toLocaleString("it-IT")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
