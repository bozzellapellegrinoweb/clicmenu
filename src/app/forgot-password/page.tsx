"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { ClicmenuLogo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      toast("Errore durante l'invio. Controlla l'email.", "error");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <ClicmenuLogo height={100} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {sent ? "Email inviata!" : "Password dimenticata?"}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {sent
              ? `Controlla la casella ${email}`
              : "Ti mandiamo un link per reimpostare la password"}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-float p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-slate-500 text-sm mb-6">
                Abbiamo inviato un link a <strong>{email}</strong>. Clicca il link nell&apos;email per scegliere una nuova password.
              </p>
              <p className="text-xs text-slate-400">Non hai ricevuto l&apos;email? Controlla la cartella spam o{" "}
                <button onClick={() => setSent(false)} className="text-emerald-600 font-medium hover:underline">
                  riprova
                </button>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="nome@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Button type="submit" className="w-full mt-2 shadow-sm shadow-emerald-500/20" size="lg" loading={loading}>
                Invia link di reset
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Torna al login
          </Link>
        </p>
      </div>
    </div>
  );
}
