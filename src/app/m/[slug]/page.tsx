import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { slugify } from "@/lib/slug";

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
    .select("id, name")
    .eq("business_id", business.id)
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(1);

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

  redirect(`/m/${slug}/${slugify(menus[0].name)}`);
}
