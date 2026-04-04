"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Sparkles, Check, Trash2, Plus, ArrowRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagBadge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import type { ExtractedMenu, ExtractedCategory, ExtractedItem, ItemTag } from "@/types";

type Step = "upload" | "name" | "review" | "saving";

export default function NewMenuPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [menuName, setMenuName] = useState("");
  const [extracted, setExtracted] = useState<ExtractedMenu | null>(null);
  const [editedMenu, setEditedMenu] = useState<ExtractedMenu | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
    const isPdfFile = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isHeic = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
    if (!isPdfFile && !isHeic) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  async function handleExtract() {
    if (!imageFile) return;
    setExtracting(true);
    setStep("name");

    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await fetch("/api/ai/extract", { method: "POST", body: formData });
    const json = await res.json();

    if (!res.ok) {
      toast(json.error || "Errore durante l'estrazione", "error");
      setStep("upload");
      setExtracting(false);
      return;
    }

    setExtracted(json.data);
    setEditedMenu(json.data);
    setExtracting(false);
    setStep("name");
  }

  function updateItem(catIdx: number, itemIdx: number, field: keyof ExtractedItem, value: string | number | null | ItemTag[]) {
    if (!editedMenu) return;
    const updated = { ...editedMenu };
    updated.categories = updated.categories.map((cat, ci) => {
      if (ci !== catIdx) return cat;
      return {
        ...cat,
        items: cat.items.map((item, ii) => {
          if (ii !== itemIdx) return item;
          return { ...item, [field]: value };
        }),
      };
    });
    setEditedMenu(updated);
  }

  function removeItem(catIdx: number, itemIdx: number) {
    if (!editedMenu) return;
    const updated = { ...editedMenu };
    updated.categories = updated.categories.map((cat, ci) => {
      if (ci !== catIdx) return cat;
      return { ...cat, items: cat.items.filter((_, ii) => ii !== itemIdx) };
    });
    setEditedMenu(updated);
  }

  function addItem(catIdx: number) {
    if (!editedMenu) return;
    const newItem: ExtractedItem = { name: "", description: null, price: null, tags: [] };
    const updated = { ...editedMenu };
    updated.categories = updated.categories.map((cat, ci) => {
      if (ci !== catIdx) return cat;
      return { ...cat, items: [...cat.items, newItem] };
    });
    setEditedMenu(updated);
  }

  function updateCategoryName(catIdx: number, name: string) {
    if (!editedMenu) return;
    const updated = { ...editedMenu };
    updated.categories = updated.categories.map((cat, ci) =>
      ci === catIdx ? { ...cat, name } : cat
    );
    setEditedMenu(updated);
  }

  async function handleSave() {
    if (!editedMenu || !menuName.trim()) return;
    setIsSaving(true);
    setStep("saving");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!business) {
      toast("Profilo attività non trovato", "error");
      setStep("review");
      return;
    }

    // Create menu
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .insert({ business_id: business.id, name: menuName.trim() })
      .select()
      .single();

    if (menuError || !menu) {
      toast("Errore nella creazione del menu", "error");
      setStep("review");
      return;
    }

    // Insert categories and items
    for (let catOrder = 0; catOrder < editedMenu.categories.length; catOrder++) {
      const cat = editedMenu.categories[catOrder];
      if (!cat.name.trim()) continue;

      const { data: category, error: catError } = await supabase
        .from("categories")
        .insert({ menu_id: menu.id, name: cat.name.trim(), sort_order: catOrder })
        .select()
        .single();

      if (catError || !category) continue;

      const items = cat.items
        .filter((item) => item.name.trim())
        .map((item, itemOrder) => ({
          category_id: category.id,
          name: item.name.trim(),
          description: item.description || null,
          price: item.price,
          tags: item.tags || [],
          sort_order: itemOrder,
        }));

      if (items.length > 0) {
        await supabase.from("items").insert(items);
      }
    }

    toast("Menu creato con successo! 🎉", "success");
    router.push(`/dashboard/menus/${menu.id}`);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Nuovo menu</h1>
        <p className="text-slate-500 mt-1">Scatta o carica una foto del menu cartaceo</p>
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="max-w-xl">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif,.pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {imageFile ? (
              <div className="relative">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview menu" className="max-h-64 mx-auto rounded-xl object-contain" />
                ) : (
                  <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                    <FileText className="w-12 h-12 text-red-400" />
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-3 font-medium">{imageFile.name}</p>
                <p className="text-xs text-slate-400">Clicca per cambiare file</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-slate-100 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="font-semibold text-slate-700 mb-1">Carica il menu</p>
                <p className="text-sm text-slate-400 mb-3">
                  Foto · PDF · HEIC (iPhone) · Max 20MB
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-emerald-500" /> Foto menu</span>
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-red-400" /> PDF listino</span>
                </div>
              </>
            )}
          </div>

          {imageFile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Button onClick={handleExtract} className="w-full" size="lg">
                <Sparkles className="w-4 h-4" />
                Estrai menu con AI
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Step: Extracting / Name */}
      {step === "name" && (
        <div className="max-w-xl">
          {extracting ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                L&apos;AI sta analizzando il menu...
              </h2>
              <p className="text-sm text-slate-400 mb-6">Ci vogliono pochi secondi</p>
              <Spinner size="lg" className="mx-auto" />
            </div>
          ) : extracted ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-emerald rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Menu estratto con successo!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {extracted.categories.length} categorie ·{" "}
                    {extracted.categories.reduce((s, c) => s + c.items.length, 0)} piatti
                  </p>
                </div>
              </div>

              <Input
                label="Nome del menu"
                placeholder="Es. Menu Pranzo, Carta dei Vini, Trattamenti Spa..."
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                autoFocus
              />

              <Button
                className="w-full mt-4"
                size="lg"
                onClick={() => setStep("review")}
                disabled={!menuName.trim()}
              >
                Rivedi e salva
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : null}
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && editedMenu && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{menuName}</h2>
              <p className="text-sm text-slate-400">
                Rivedi e modifica prima di salvare
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                ← Ricarica foto
              </Button>
              <Button onClick={handleSave} loading={isSaving}>
                <Check className="w-4 h-4" />
                Salva menu
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {editedMenu.categories.map((cat, catIdx) => (
              <CategoryEditor
                key={catIdx}
                category={cat}
                catIdx={catIdx}
                onUpdateName={(name) => updateCategoryName(catIdx, name)}
                onUpdateItem={(itemIdx, field, value) => updateItem(catIdx, itemIdx, field, value)}
                onRemoveItem={(itemIdx) => removeItem(catIdx, itemIdx)}
                onAddItem={() => addItem(catIdx)}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} size="lg" loading={isSaving}>
              <Check className="w-4 h-4" />
              Salva menu
            </Button>
          </div>
        </div>
      )}

      {step === "saving" && (
        <div className="text-center py-20">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-500">Salvataggio in corso...</p>
        </div>
      )}
    </div>
  );
}

function CategoryEditor({
  category,
  catIdx,
  onUpdateName,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
}: {
  category: ExtractedCategory;
  catIdx: number;
  onUpdateName: (name: string) => void;
  onUpdateItem: (itemIdx: number, field: keyof ExtractedItem, value: string | number | null | ItemTag[]) => void;
  onRemoveItem: (itemIdx: number) => void;
  onAddItem: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Category header */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
        <input
          className="flex-1 bg-transparent font-semibold text-slate-900 focus:outline-none text-lg"
          value={category.name}
          onChange={(e) => onUpdateName(e.target.value)}
          placeholder="Nome categoria"
        />
        <span className="text-xs text-slate-400">{category.items.length} piatti</span>
      </div>

      {/* Items */}
      <div className="divide-y divide-slate-50">
        <AnimatePresence>
          {category.items.map((item, itemIdx) => (
            <motion.div
              key={itemIdx}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 py-4"
            >
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 text-sm font-medium text-slate-900 border-b border-slate-200 focus:border-emerald-400 focus:outline-none pb-0.5 bg-transparent"
                      value={item.name}
                      onChange={(e) => onUpdateItem(itemIdx, "name", e.target.value)}
                      placeholder="Nome piatto"
                    />
                    <input
                      className="w-20 text-sm text-right text-slate-700 border-b border-slate-200 focus:border-emerald-400 focus:outline-none pb-0.5 bg-transparent"
                      value={item.price ?? ""}
                      type="number"
                      step="0.01"
                      min="0"
                      onChange={(e) =>
                        onUpdateItem(itemIdx, "price", e.target.value ? parseFloat(e.target.value) : null)
                      }
                      placeholder="€ —"
                    />
                  </div>
                  {(item.description !== null || item.name) && (
                    <input
                      className="w-full text-xs text-slate-500 focus:outline-none bg-transparent"
                      value={item.description ?? ""}
                      onChange={(e) =>
                        onUpdateItem(itemIdx, "description", e.target.value || null)
                      }
                      placeholder="Descrizione (opzionale)"
                    />
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onRemoveItem(itemIdx)}
                  className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add item */}
      <div className="px-5 py-3 border-t border-slate-50">
        <button
          onClick={onAddItem}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Aggiungi piatto
        </button>
      </div>
    </div>
  );
}
