import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PWAInstallBanner } from "@/components/dashboard/pwa-install-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Admin → always redirect to /admin
  const ADMIN_EMAILS = ["info@clicmenu.ai"];
  if (ADMIN_EMAILS.includes(user.email ?? "")) redirect("/admin");

  if (!ADMIN_EMAILS.includes(user.email ?? "")) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!business) redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
      <PWAInstallBanner />
    </div>
  );
}
