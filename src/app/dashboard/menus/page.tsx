import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, BookOpen, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030";
const isProd = appUrl.includes("clicmenu.ai");

function publicUrl(slug: string) {
  return isProd ? `https://${slug}.clicmenu.ai` : `/m/${slug}`;
}

export default async function MenusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("user_id", user!.id)
    .single();

  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .eq("business_id", business?.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">I miei menu</h1>
          <p className="text-slate-500 mt-1">Gestisci e pubblica i tuoi menu digitali</p>
        </div>
        <Link href="/dashboard/menus/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nuovo menu
          </Button>
        </Link>
      </div>

      {!menus || menus.length === 0 ? (
        <Card className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2 text-lg">Nessun menu ancora</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Crea il tuo primo menu digitale. Basta una foto del menu cartaceo.
          </p>
          <Link href="/dashboard/menus/new">
            <Button size="lg">
              <Plus className="w-4 h-4" />
              Crea il primo menu
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menus.map((menu) => (
            <Card key={menu.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{menu.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(menu.created_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant={menu.is_published ? "emerald" : "slate"}>
                  {menu.is_published ? "Pubblicato" : "Bozza"}
                </Badge>
              </div>

              <div className="flex gap-2 mt-auto">
                <Link href={`/dashboard/menus/${menu.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Pencil className="w-3.5 h-3.5" />
                    Modifica
                  </Button>
                </Link>
                {menu.is_published && (
                  <Link
                    href={business?.slug ? publicUrl(business.slug) : "#"}
                    target="_blank"
                    className="flex-1"
                  >
                    <Button variant="ghost" size="sm" className="w-full">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visualizza
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}

          {/* Add new card */}
          <Link href="/dashboard/menus/new">
            <Card className="flex flex-col items-center justify-center py-10 border-dashed border-2 border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">
                Aggiungi menu
              </p>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
