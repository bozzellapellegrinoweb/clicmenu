"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ClicmenuLogo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast(error.message === "Invalid login credentials"
        ? "Email o password non corretti"
        : error.message, "error");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <ClicmenuLogo height={100} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bentornato</h1>
          <p className="text-slate-400 mt-1 text-sm">Accedi al tuo account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-float p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="nome@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors">
                  Password dimenticata?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full mt-2 shadow-sm shadow-emerald-500/20" size="lg" loading={loading}>
              Accedi
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Non hai un account?{" "}
          <Link href="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
            Inizia gratis →
          </Link>
        </p>
      </div>
    </div>
  );
}
