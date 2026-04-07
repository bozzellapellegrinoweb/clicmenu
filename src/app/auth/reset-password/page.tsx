"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { ClicmenuLogo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (!tokenHash || type !== "recovery") {
        setVerifying(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "recovery",
      });

      setValid(!error);
      setVerifying(false);
    }

    verifyToken();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast("Le password non coincidono", "error");
      return;
    }
    if (password.length < 6) {
      toast("La password deve essere di almeno 6 caratteri", "error");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast("Errore: " + error.message, "error");
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <ClicmenuLogo height={100} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {done ? "Password aggiornata!" : "Nuova password"}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {done ? "Verrai reindirizzato al login..." : "Scegli una nuova password sicura"}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-float p-8">
          {verifying ? (
            <p className="text-center text-slate-400 text-sm py-4">Verifica link in corso...</p>
          ) : !valid ? (
            <div className="text-center">
              <p className="text-slate-500 text-sm mb-4">
                Il link non è valido o è scaduto. Richiedine uno nuovo.
              </p>
              <Link href="/forgot-password">
                <Button className="w-full">Richiedi nuovo link</Button>
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-slate-500 text-sm">
                Password aggiornata con successo. Stai per essere reindirizzato al login.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="Nuova password"
                  type={showPw ? "text" : "password"}
                  placeholder="Minimo 6 caratteri"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Input
                label="Conferma password"
                type="password"
                placeholder="Ripeti la password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Button
                type="submit"
                className="w-full mt-2 shadow-sm shadow-emerald-500/20"
                size="lg"
                loading={loading}
              >
                Salva nuova password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
