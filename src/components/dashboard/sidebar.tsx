"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, CreditCard, LogOut, Settings, ChevronRight, BarChart2, Menu, X } from "lucide-react";
import { ClicmenuLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/menus", icon: BookOpen, label: "I miei menu", exact: false },
  { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics", exact: false },
  { href: "/dashboard/billing", icon: CreditCard, label: "Piano", exact: false },
  { href: "/dashboard/settings", icon: Settings, label: "Impostazioni", exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        supabase.from("businesses").select("name").eq("user_id", user.id).single()
          .then(({ data }) => setBusinessName(data?.name ?? null));
      }
    });
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = businessName
    ? businessName.slice(0, 2).toUpperCase()
    : userEmail ? userEmail.slice(0, 2).toUpperCase() : "?";

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-5 space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group",
              active
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-emerald-600" : "")} />
            <span className="flex-1">{item.label}</span>
            {active && <ChevronRight className="w-3.5 h-3.5 text-emerald-400 opacity-60" />}
          </Link>
        );
      })}
    </nav>
  );

  const UserFooter = () => (
    <div className="px-3 pb-4 border-t border-slate-100 pt-3 space-y-1">
      {userEmail && (
        <div className="px-3 py-3 rounded-xl bg-slate-50 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              {businessName && <p className="text-xs font-semibold text-slate-900 truncate">{businessName}</p>}
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all w-full"
      >
        <LogOut className="w-4 h-4" />
        Esci
      </button>
    </div>
  );

  return (
    <>
      {/* ── Mobile top header ──────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4">
        <Link href="/dashboard">
          <ClicmenuLogo height={36} />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
      </header>

      {/* ── Mobile drawer overlay ──────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ─────────────────────────────── */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white flex flex-col shadow-2xl transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100">
          <ClicmenuLogo height={36} />
          <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <NavLinks />
        <UserFooter />
      </aside>

      {/* ── Desktop sidebar ───────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col h-screen sticky top-0 bg-white border-r border-slate-100">
        <div className="h-16 flex items-center px-5 border-b border-slate-100">
          <Link href="/dashboard">
            <ClicmenuLogo height={100} />
          </Link>
        </div>
        <NavLinks />
        <UserFooter />
      </aside>
    </>
  );
}
