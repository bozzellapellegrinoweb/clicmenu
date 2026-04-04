import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicMenuView } from "@/components/public-menu/public-menu-view";
import { slugify } from "@/lib/slug";

interface Params {
  params: Promise<{ slug: string; menuSlug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, menuSlug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("slug", slug)
    .single();

  if (!business) return { title: "Menu digitale" };

  // Find the menu by slug
  const { data: menus } = await supabase
    .from("menus")
    .select("name")
    .eq("business_id", (await supabase.from("businesses").select("id").eq("slug", slug).single()).data?.id)
    .eq("is_published", true);

  const menu = menus?.find((m) => slugify(m.name) === menuSlug);

  return {
    title: menu
      ? `${menu.name} — ${business.name}`
      : `Menu — ${business.name}`,
    description: `Scopri il menu di ${business.name}`,
  };
}

export default async function PublicMenuSlugPage({ params }: Params) {
  const { slug, menuSlug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!business) notFound();

  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .eq("business_id", business.id)
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (!menus || menus.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{business.name}</h1>
          <p className="text-slate-500">Nessun menu disponibile al momento.</p>
        </div>
      </div>
    );
  }

  // Find the specific menu by slug, fall back to first
  const targetMenu = menus.find((m) => slugify(m.name) === menuSlug) ?? menus[0];

  const { data: categories } = await supabase
    .from("categories")
    .select("*, items(*)")
    .eq("menu_id", targetMenu.id)
    .order("sort_order");

  const menuWithData = {
    ...targetMenu,
    categories: (categories || []).map((cat) => ({
      ...cat,
      items: (cat.items || []).sort(
        (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
      ),
    })),
  };

  return <PublicMenuView business={business} menus={[menuWithData]} />;
}
