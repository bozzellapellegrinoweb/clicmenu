"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, LogOut, BarChart2, Menu, X, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const nav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Utenti", href: "/admin/users", icon: Users },
  { label: "Abbonamenti", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              active
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const Footer = () => (
    <div className="px-3 py-4 border-t border-slate-800 space-y-1">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">Super Admin</span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );

  const Logo = () => (
    <div className="flex items-center gap-3">
      <Image src="/logo.svg" alt="Clicmenu.ai" width={120} height={30} className="brightness-0 invert" />
    </div>
  );

  return (
    <>
      {/* ── Mobile top header ──────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 h-14 flex items-center justify-between px-4">
        <Logo />
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center"
        >
          <Menu className="w-5 h-5 text-slate-300" />
        </button>
      </header>

      {/* ── Mobile overlay ────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile drawer ─────────────────────────────── */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 flex flex-col shadow-2xl transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-800">
          <Logo />
          <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <NavLinks />
        <Footer />
      </aside>

      {/* ── Desktop sidebar ───────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 min-h-screen bg-slate-900 flex-col">
        <div className="px-5 py-6 border-b border-slate-800">
          <Logo />
        </div>
        <NavLinks />
        <Footer />
      </aside>
    </>
  );
}
