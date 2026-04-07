"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils";
import { trackCompleteRegistration, trackStartTrial } from "@/components/meta-tracker";
import type { BusinessType } from "@/types";

const BUSINESS_TYPE_OPTIONS = [
  { value: "restaurant", label: "🍽️ Ristorante" },
  { value: "pizzeria", label: "🍕 Pizzeria" },
  { value: "bar", label: "☕ Bar / Caffè" },
  { value: "spa", label: "💆 Spa / Centro Benessere" },
  { value: "hotel", label: "🏨 Hotel" },
  { value: "cafe", label: "🥐 Pasticceria / Gelateria" },
  { value: "other", label: "🏪 Altro" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState<BusinessType>("restaurant");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Generate unique slug — try clean slug first, then add short suffix if taken
    const baseSlug = slugify(name);
    let slug = baseSlug;

    const { count } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("slug", baseSlug);

    if ((count ?? 0) > 0) {
      const suffix = Math.random().toString(36).slice(2, 5);
      slug = `${baseSlug}-${suffix}`;
    }

    const { error } = await supabase.from("businesses").insert({
      user_id: user.id,
      name: name.trim(),
      type,
      slug,
    });

    if (error) {
      toast("Errore nella creazione del profilo. Riprova.", "error");
      setLoading(false);
      return;
    }

    // Create trial subscription
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      status: "trialing",
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Meta CAPI events
    trackCompleteRegistration();
    trackStartTrial();

    // Send welcome email + sync CRM (fire and forget)
    const trimmedName = name.trim();
    fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "welcome", name: trimmedName }),
    }).catch(() => {});

    fetch("/api/crm/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName }),
    }).catch(() => {});

    toast(`Benvenuto in Clicmenu.ai, ${name}!`, "success");
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Parliamo della tua attività</h1>
          <p className="text-slate-500 mt-2">Ci vuole un minuto. Promesso.</p>
        </div>

        <div className="glass-strong rounded-3xl p-8 border border-white/60">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nome dell'attività"
              placeholder="Es. Trattoria Da Mario"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <Select
              label="Tipo di attività"
              options={BUSINESS_TYPE_OPTIONS}
              value={type}
              onChange={(e) => setType(e.target.value as BusinessType)}
            />

            {name && (
              <div className="glass-emerald rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400">Il tuo menu sarà accessibile su:</p>
                <p className="text-sm font-mono text-emerald-700 mt-0.5">
                  {slugify(name) || "nome-attivita"}.clicmenu.ai
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Crea il mio profilo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
