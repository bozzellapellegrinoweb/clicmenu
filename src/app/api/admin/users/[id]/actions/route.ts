import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_EMAILS = ["info@clicmenu.ai"];

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) return null;
  return user;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  // Get target user email for actions that need it
  const { data: { user: targetUser } } = await getSupabaseAdmin().auth.admin.getUserById(id);
  if (!targetUser) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  if (action === "reset_password") {
    const { error } = await getSupabaseAdmin().auth.resetPasswordForEmail(targetUser.email!, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: `Email di reset inviata a ${targetUser.email}` });
  }

  if (action === "update_subscription") {
    const { status } = body;
    const validStatuses = ["active", "trialing", "past_due", "canceled"];
    if (!validStatuses.includes(status)) return NextResponse.json({ error: "Stato non valido" }, { status: 400 });

    const { error } = await getSupabaseAdmin()
      .from("subscriptions")
      .upsert({ user_id: id, status }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: `Abbonamento impostato a: ${status}` });
  }

  if (action === "extend_trial") {
    const { days, currentExpiresAt } = body;
    if (!days || days < 1) return NextResponse.json({ error: "Giorni non validi" }, { status: 400 });
    // Extend from current expiry or from now
    const base = currentExpiresAt && new Date(currentExpiresAt).getTime() > Date.now()
      ? new Date(currentExpiresAt)
      : new Date();
    const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await getSupabaseAdmin()
      .from("subscriptions")
      .upsert({ user_id: id, status: "trialing", expires_at: newExpiry }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: `Trial esteso di ${days} giorni (scade ${new Date(newExpiry).toLocaleDateString("it-IT")})` });
  }

  if (action === "delete_user") {
    // Delete business data first (cascade should handle the rest)
    const { data: business } = await getSupabaseAdmin().from("businesses").select("id").eq("user_id", id).single();
    if (business) {
      const { data: menus } = await getSupabaseAdmin().from("menus").select("id").eq("business_id", business.id);
      for (const menu of menus ?? []) {
        const { data: cats } = await getSupabaseAdmin().from("categories").select("id").eq("menu_id", menu.id);
        for (const cat of cats ?? []) {
          await getSupabaseAdmin().from("items").delete().eq("category_id", cat.id);
        }
        await getSupabaseAdmin().from("categories").delete().eq("menu_id", menu.id);
      }
      await getSupabaseAdmin().from("menus").delete().eq("business_id", business.id);
      await getSupabaseAdmin().from("businesses").delete().eq("id", business.id);
    }
    await getSupabaseAdmin().from("subscriptions").delete().eq("user_id", id);
    const { error } = await getSupabaseAdmin().auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Utente eliminato" });
  }

  return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
}
