"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, CreditCard, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { PLAN_PRICE_EUR } from "@/lib/stripe";

const PLAN_FEATURES = [
  "Menu digitali illimitati",
  "Estrazione AI dalla foto",
  "Pagina pubblica con QR code",
  "Foto per ogni piatto",
  "Tag allergeni automatici",
  "Aggiornamenti illimitati",
  "Supporto via email",
];

export default function BillingPage() {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<{
    status: string;
    expires_at: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("subscriptions")
        .select("status, expires_at")
        .eq("user_id", user.id)
        .single();

      setSubscription(data);
      setLoading(false);
    }
    loadSubscription();
  }, []);

  async function handleCheckout() {
    setCheckoutLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url, error } = await res.json();

    if (error || !url) {
      toast("Errore nel pagamento. Riprova.", "error");
      setCheckoutLoading(false);
      return;
    }

    window.location.href = url;
  }

  const isActive = subscription?.status === "active";
  const isTrialing = subscription?.status === "trialing";
  const isPastDue = subscription?.status === "past_due";

  const trialDaysLeft = subscription?.expires_at && isTrialing
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Piano e fatturazione</h1>
        <p className="text-slate-500 mt-1">Gestisci il tuo abbonamento</p>
      </div>

      {/* Status card */}
      {isTrialing && (
        <div className="glass-emerald rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Periodo di prova — {trialDaysLeft} giorni rimanenti
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Attiva il piano Pro per continuare dopo la scadenza
            </p>
          </div>
        </div>
      )}

      {isPastDue && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Pagamento non riuscito</p>
            <p className="text-xs text-red-600 mt-0.5">Aggiorna il metodo di pagamento per continuare</p>
          </div>
        </div>
      )}

      <div className="max-w-sm">
        <Card className={`relative overflow-hidden ${isActive ? "border-emerald-200" : ""}`}>
          {isActive && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-semibold text-slate-900">Piano Pro</span>
            </div>
            <Badge variant={isActive ? "emerald" : isTrialing ? "amber" : "slate"}>
              {isActive ? "Attivo" : isTrialing ? "Trial" : "Inattivo"}
            </Badge>
          </div>

          <div className="mb-6">
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-slate-900">€{PLAN_PRICE_EUR}</span>
              <span className="text-slate-400 mb-1">/anno</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">≈ €3,08 al mese · IVA esclusa</p>
          </div>

          <ul className="space-y-2.5 mb-6">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {isActive ? (
            <div className="text-center">
              <p className="text-sm text-slate-500">Piano attivo — grazie! 🎉</p>
              <p className="text-xs text-slate-400 mt-1">
                Gestisci il pagamento tramite il portale Stripe
              </p>
            </div>
          ) : (
            <Button className="w-full" size="lg" onClick={handleCheckout} loading={checkoutLoading}>
              {isTrialing ? "Attiva piano Pro →" : "Rinnova abbonamento →"}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
