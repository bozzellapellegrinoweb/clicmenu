import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Eye, TrendingUp, Camera, BarChart2 } from "lucide-react";

function formatDay(dateStr: string, locale = "it-IT") {
  return new Date(dateStr).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("user_id", user!.id)
    .single();

  if (!business) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch last 30 days of views
  const { data: views } = await getSupabaseAdmin()
    .from("menu_views")
    .select("viewed_at")
    .eq("business_id", business.id)
    .gte("viewed_at", thirtyDaysAgo)
    .order("viewed_at", { ascending: true });

  // Fetch last 30 days of clicks
  const { data: clicks } = await getSupabaseAdmin()
    .from("item_clicks")
    .select("item_id, clicked_at")
    .eq("business_id", business.id)
    .gte("clicked_at", thirtyDaysAgo);

  // Aggregate views by day (last 7 days)
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = 0;
  }
  for (const v of views ?? []) {
    const key = v.viewed_at.slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }
  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
  const maxBar = Math.max(...dailyData.map((d) => d.count), 1);

  // Stats
  const totalViews    = views?.length ?? 0;
  const viewsThisWeek = (views ?? []).filter((v) => v.viewed_at >= sevenDaysAgo).length;
  const totalClicks   = clicks?.length ?? 0;

  // Top clicked items
  const clickMap: Record<string, number> = {};
  for (const c of clicks ?? []) {
    clickMap[c.item_id] = (clickMap[c.item_id] ?? 0) + 1;
  }
  const topItemIds = Object.entries(clickMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }));

  // Fetch item names for top items
  const topItems: { id: string; name: string; count: number }[] = [];
  if (topItemIds.length > 0) {
    const { data: itemRows } = await getSupabaseAdmin()
      .from("items")
      .select("id, name")
      .in("id", topItemIds.map((i) => i.id));

    for (const { id, count } of topItemIds) {
      const item = itemRows?.find((r) => r.id === id);
      if (item) topItems.push({ id, name: item.name, count });
    }
  }

  const maxClicks = Math.max(...topItems.map((i) => i.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">Statistiche di visualizzazione del tuo menu pubblico</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Totale</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{totalViews.toLocaleString("it-IT")}</p>
          <p className="text-sm text-slate-500 mt-1">Visualizzazioni menu</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">7 giorni</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{viewsThisWeek.toLocaleString("it-IT")}</p>
          <p className="text-sm text-slate-500 mt-1">Questa settimana</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">30 giorni</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{totalClicks.toLocaleString("it-IT")}</p>
          <p className="text-sm text-slate-500 mt-1">Click su foto piatti</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart — last 7 days */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Visualizzazioni ultimi 7 giorni</h2>
          </div>

          {totalViews === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Eye className="w-8 h-8 text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">Nessuna visualizzazione ancora</p>
              <p className="text-xs text-slate-300 mt-1">I dati appariranno quando qualcuno visita il menu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyData.map(({ date, count }) => (
                <div key={date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-24 flex-shrink-0">{formatDay(date)}</span>
                  <div className="flex-1 bg-slate-50 rounded-full h-7 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-end pr-3 transition-all"
                      style={{ width: count === 0 ? "0%" : `${Math.max((count / maxBar) * 100, 8)}%` }}
                    >
                      {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                    </div>
                  </div>
                  {count === 0 && <span className="text-xs text-slate-300 w-6">0</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top clicked items */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Camera className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Piatti più cliccati (foto)</h2>
          </div>

          {topItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Camera className="w-8 h-8 text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">Nessun click registrato</p>
              <p className="text-xs text-slate-300 mt-1">I dati appariranno quando i clienti aprono le foto</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topItems.map(({ id, name, count }, i) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-200 w-5 flex-shrink-0 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                    <div className="mt-1.5 bg-slate-50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-500"
                        style={{ width: `${(count / maxClicks) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-500 flex-shrink-0 w-12 text-right">
                    {count} <span className="text-xs font-normal text-slate-300">click</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-slate-300 text-center">
        I dati sono aggiornati in tempo reale. Le visualizzazioni vengono conteggiate ad ogni apertura del menu pubblico.
      </p>
    </div>
  );
}
