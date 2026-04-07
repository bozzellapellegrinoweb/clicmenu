"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ClicmenuLogo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const PERKS = [
  "14 giorni gratis, nessuna carta richiesta",
  "Menu digitali illimitati",
  "Estrazione AI dalla foto",
  "QR code per ogni menu",
];

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast("La password deve essere di almeno 8 caratteri", "error");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast(error.message, "error");
      setLoading(false);
      return;
    }

    // Auto-login after signup
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (!loginError) {
      router.push("/onboarding");
    } else {
      toast("Account creato! Controlla la tua email per confermare.", "success");
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <ClicmenuLogo height={100} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inizia gratis</h1>
          <p className="text-slate-400 mt-1 text-sm">14 giorni di prova, senza carta di credito</p>
        </div>

        {/* Perks */}
        <div className="flex flex-col gap-2 mb-6">
          {PERKS.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              </div>
              {p}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-float p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="nome@ristorante.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimo 8 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              hint="Minimo 8 caratteri"
            />
            <Button type="submit" className="w-full mt-2 shadow-sm shadow-emerald-500/20" size="lg" loading={loading}>
              Crea account gratis
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Registrandoti accetti i{" "}
          <Link href="/termini" className="underline hover:text-slate-600 transition-colors">Termini di servizio</Link>
          {" "}e la{" "}
          <Link href="/privacy" className="underline hover:text-slate-600 transition-colors">Privacy Policy</Link>
        </p>

        <p className="text-center text-sm text-slate-400 mt-4">
          Hai già un account?{" "}
          <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
            Accedi →
          </Link>
        </p>
      </div>
    </div>
  );
}
