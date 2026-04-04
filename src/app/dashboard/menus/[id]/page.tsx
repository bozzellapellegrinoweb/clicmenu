import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MenuEditorClient } from "@/components/menu-editor/menu-editor-client";

export default async function MenuEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug, name")
    .eq("user_id", user!.id)
    .single();

  if (!business) notFound();

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();

  if (!menu) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("*, items(*)")
    .eq("menu_id", id)
    .order("sort_order");

  const categoriesWithItems = (categories || []).map((cat) => ({
    ...cat,
    items: (cat.items || []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  }));

  return (
    <MenuEditorClient
      menu={menu}
      business={business}
      initialCategories={categoriesWithItems}
    />
  );
}
