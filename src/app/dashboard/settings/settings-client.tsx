"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, Building2, Phone, MapPin, CheckCircle, Check, Palette, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

interface Business {
  id: string;
  name: string;
  type: string;
  slug: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  brand_color: string | null;
  google_review_url: string | null;
}

const BRAND_COLORS = [
  { label: "Smeraldo",  value: "#10b981" },
  { label: "Oceano",    value: "#0ea5e9" },
  { label: "Cobalto",   value: "#6366f1" },
  { label: "Viola",     value: "#a855f7" },
  { label: "Rosa",      value: "#ec4899" },
  { label: "Rosso",     value: "#ef4444" },
  { label: "Arancio",   value: "#f97316" },
  { label: "Oro",       value: "#eab308" },
  { label: "Ardesia",   value: "#64748b" },
  { label: "Antracite", value: "#1e293b" },
];

export function SettingsClient({ business }: { business: Business }) {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(business.logo_url);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(business.name);
  const [address, setAddress] = useState(business.address ?? "");
  const [phone, setPhone] = useState(business.phone ?? "");
  const [brandColor, setBrandColor] = useState(business.brand_color ?? "#10b981");
  const [googleReviewUrl, setGoogleReviewUrl] = useState(business.google_review_url ?? "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast("Carica un'immagine (JPG, PNG, WebP)", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast("Il logo non può superare 2MB", "error");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast("Errore upload: " + uploadError.message, "error");
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
    const urlWithTs = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("businesses").update({ logo_url: urlWithTs }).eq("id", business.id);
    setLogoUrl(urlWithTs);
    toast("Logo aggiornato!", "success");
    setUploading(false);
  }

  async function removeLogo() {
    const supabase = createClient();
    await supabase.from("businesses").update({ logo_url: null }).eq("id", business.id);
    setLogoUrl(null);
    toast("Logo rimosso", "info");
  }

  async function saveInfo() {
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("businesses")
      .update({ name: name.trim(), address: address || null, phone: phone || null, brand_color: brandColor, google_review_url: googleReviewUrl || null })
      .eq("id", business.id);
    setSaving(false);
    if (error) toast("Errore salvataggio", "error");
    else toast("Informazioni aggiornate", "success");
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Logo attività</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo"
                className="rounded-2xl object-cover w-20 h-20 border border-slate-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center" style={{ background: brandColor + "15" }}>
                <Building2 className="w-8 h-8" style={{ color: brandColor }} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: brandColor }}
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Caricamento..." : "Carica logo"}
            </button>
            {logoUrl && (
              <button
                onClick={removeLogo}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Rimuovi
              </button>
            )}
            <p className="text-xs text-slate-400">JPG, PNG o WebP · max 2MB</p>
          </div>
        </div>
      </div>

      {/* Colore brand */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Colore del menu</h2>
        </div>
        <p className="text-sm text-slate-400 mb-5">Viene usato nell&apos;header e negli accenti del menu pubblico.</p>

        <div className="flex flex-wrap gap-3">
          {BRAND_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => setBrandColor(c.value)}
              className="relative w-9 h-9 rounded-xl transition-transform hover:scale-110 focus:outline-none"
              style={{ backgroundColor: c.value }}
            >
              {brandColor === c.value && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white drop-shadow" />
                </span>
              )}
            </button>
          ))}

          {/* Custom color input */}
          <label className="relative w-9 h-9 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors overflow-hidden" title="Colore personalizzato">
            <span className="text-xs text-slate-400">+</span>
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>

        {/* Preview */}
        <div className="mt-5 rounded-xl overflow-hidden border border-slate-100">
          <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">{name || "Nome attività"}</span>
          </div>
          <div className="bg-white px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-700">Esempio piatto</span>
            <span className="text-sm font-bold" style={{ color: brandColor }}>€12,00</span>
          </div>
        </div>
      </div>

      {/* Info attività */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Informazioni attività</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome attività</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Indirizzo</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Via Roma 1, Milano"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 02 1234567"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={saveInfo}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: brandColor }}
            >
              <CheckCircle className="w-4 h-4" />
              {saving ? "Salvataggio..." : "Salva modifiche"}
            </button>
          </div>
        </div>
      </div>

      {/* Google Review */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-slate-900">Recensioni Google</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Incolla il link diretto alla tua scheda Google per raccogliere recensioni dai clienti.
        </p>
        <div className="space-y-3">
          <input
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
          />
          <p className="text-xs text-slate-400">
            Trovi il link su{" "}
            <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              Google Business Profile
            </a>
            {" "}→ Ottieni altre recensioni → Condividi il link
          </p>
        </div>
      </div>

      {/* Slug info */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
        <p className="text-xs text-slate-500">
          <span className="font-medium">URL pubblico menu:</span>{" "}
          <a href={`/m/${business.slug}`} target="_blank" className="hover:underline font-mono" style={{ color: brandColor }}>
            /m/{business.slug}
          </a>
        </p>
      </div>
    </div>
  );
}
