import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicMenuView } from "@/components/public-menu/public-menu-view";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("slug", slug)
    .single();

  return {
    title: business?.name ? `Menu — ${business.name}` : "Menu digitale",
    description: `Scopri il menu di ${business?.name}`,
  };
}

export default async function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{business.name}</h1>
          <p className="text-slate-500">Nessun menu disponibile al momento.</p>
        </div>
      </div>
    );
  }

  // Load categories and items for all published menus
  const menusWithData = await Promise.all(
    menus.map(async (menu) => {
      const { data: categories } = await supabase
        .from("categories")
        .select("*, items(*)")
        .eq("menu_id", menu.id)
        .order("sort_order");

      return {
        ...menu,
        categories: (categories || []).map((cat) => ({
          ...cat,
          items: (cat.items || []).sort(
            (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
          ),
        })),
      };
    })
  );

  return <PublicMenuView business={business} menus={menusWithData} />;
}
