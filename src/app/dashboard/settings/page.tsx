import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impostazioni — Clicmenu.ai" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Impostazioni</h1>
      <SettingsClient business={business} />
    </div>
  );
}
