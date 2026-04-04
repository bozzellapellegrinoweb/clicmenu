"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { QrCode, Globe, GlobeLock, Pencil, Check, X, Plus, Trash2, ExternalLink, ArrowLeft, Camera, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { ALL_TAGS, TAG_CATEGORY_STYLES, getTagLabel } from "@/lib/tags";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge, TagBadge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import type { Menu, CategoryWithItems, Item, ItemTag } from "@/types";

interface Props {
  menu: Menu;
  business: { id: string; slug: string; name: string };
  initialCategories: CategoryWithItems[];
}

export function MenuEditorClient({ menu, business, initialCategories }: Props) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryWithItems[]>(initialCategories);
  const [isPublished, setIsPublished] = useState(menu.is_published);
  const [menuName, setMenuName] = useState(menu.name);
  const [editingName, setEditingName] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [saving, setSaving] = useState(false);

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030"}/m/${business.slug}`;

  async function togglePublish() {
    setSaving(true);
    const supabase = createClient();
    const newPublished = !isPublished;
    const { error } = await supabase
      .from("menus")
      .update({ is_published: newPublished, published_at: newPublished ? new Date().toISOString() : null })
      .eq("id", menu.id);
    if (error) {
      toast("Errore durante la pubblicazione", "error");
    } else {
      setIsPublished(newPublished);
      toast(newPublished ? "Menu pubblicato! 🎉" : "Menu nascosto", newPublished ? "success" : "info");
    }
    setSaving(false);
  }

  async function saveMenuName() {
    if (!menuName.trim()) return;
    const supabase = createClient();
    const { error } = await supabase.from("menus").update({ name: menuName.trim() }).eq("id", menu.id);
    if (!error) { setEditingName(false); toast("Nome aggiornato", "success"); }
  }

  async function addCategory() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({ menu_id: menu.id, name: "Nuova categoria", sort_order: categories.length })
      .select().single();
    if (!error && data) setCategories((prev) => [...prev, { ...data, items: [] }]);
  }

  async function updateCategoryName(categoryId: string, name: string) {
    const supabase = createClient();
    await supabase.from("categories").update({ name }).eq("id", categoryId);
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, name } : c)));
  }

  async function deleteCategory(categoryId: string) {
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    toast("Categoria eliminata", "info");
  }

  async function addItem(categoryId: string) {
    const supabase = createClient();
    const category = categories.find((c) => c.id === categoryId);
    const { data, error } = await supabase
      .from("items")
      .insert({ category_id: categoryId, name: "Nuovo piatto", sort_order: category?.items.length ?? 0 })
      .select().single();
    if (!error && data) {
      setCategories((prev) =>
        prev.map((c) => c.id === categoryId ? { ...c, items: [...c.items, data] } : c)
      );
    }
  }

  async function updateItem(categoryId: string, itemId: string, updates: Partial<Item>) {
    const supabase = createClient();
    await supabase.from("items").update(updates).eq("id", itemId);
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)) }
          : c
      )
    );
  }

  async function deleteItem(categoryId: string, itemId: string) {
    const supabase = createClient();
    await supabase.from("items").delete().eq("id", itemId);
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      )
    );
  }

  async function reorderItems(categoryId: string, reorderedItems: Item[]) {
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, items: reorderedItems } : c))
    );
    // Persist sort_order
    const supabase = createClient();
    await Promise.all(
      reorderedItems.map((item, idx) =>
        supabase.from("items").update({ sort_order: idx }).eq("id", item.id)
      )
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/menus">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                className="text-xl font-bold text-slate-900 border-b-2 border-emerald-400 focus:outline-none bg-transparent"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") saveMenuName(); if (e.key === "Escape") setEditingName(false); }}
              />
              <button onClick={saveMenuName} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditingName(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{menuName}</h1>
              <button onClick={() => setEditingName(true)} className="p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <Badge variant={isPublished ? "emerald" : "slate"}>{isPublished ? "Pubblicato" : "Bozza"}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowQR(true)}>
            <QrCode className="w-4 h-4" />QR Code
          </Button>
          {isPublished && (
            <Link href={publicUrl} target="_blank">
              <Button variant="outline" size="sm"><ExternalLink className="w-4 h-4" />Visualizza</Button>
            </Link>
          )}
          <Button size="sm" variant={isPublished ? "secondary" : "primary"} onClick={togglePublish} loading={saving}>
            {isPublished ? <><GlobeLock className="w-4 h-4" />Nascondi</> : <><Globe className="w-4 h-4" />Pubblica</>}
          </Button>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl p-8 max-w-xs w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-slate-900 text-lg mb-2">QR Code del menu</h3>
              <p className="text-sm text-slate-500 mb-6">Stampalo sui tavoli o all&apos;ingresso</p>
              <div className="bg-white p-4 rounded-2xl inline-block mb-4">
                <QRCodeSVG value={publicUrl} size={180} fgColor="#047857" />
              </div>
              <p className="text-xs text-slate-400 mb-4 break-all">{publicUrl}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { navigator.clipboard.writeText(publicUrl); toast("Link copiato!", "success"); }}>
                  Copia link
                </Button>
                <Button className="flex-1" onClick={() => window.print()}>Stampa QR</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <CategoryBlock
            key={category.id}
            category={category}
            businessId={business.id}
            onUpdateName={(name) => updateCategoryName(category.id, name)}
            onDeleteCategory={() => deleteCategory(category.id)}
            onAddItem={() => addItem(category.id)}
            onUpdateItem={(itemId, updates) => updateItem(category.id, itemId, updates)}
            onDeleteItem={(itemId) => deleteItem(category.id, itemId)}
            onReorderItems={(items) => reorderItems(category.id, items)}
          />
        ))}

        <button
          onClick={addCategory}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl py-6 text-sm text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Aggiungi categoria
        </button>
      </div>
    </div>
  );
}

// ── CategoryBlock ──────────────────────────────────────────────────────────────

function CategoryBlock({
  category, businessId,
  onUpdateName, onDeleteCategory, onAddItem, onUpdateItem, onDeleteItem, onReorderItems,
}: {
  category: CategoryWithItems;
  businessId: string;
  onUpdateName: (name: string) => void;
  onDeleteCategory: () => void;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, updates: Partial<Item>) => void;
  onDeleteItem: (itemId: string) => void;
  onReorderItems: (items: Item[]) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(category.name);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function saveNameLocal() { onUpdateName(localName); setEditingName(false); }

  function moveItem(fromIdx: number, toIdx: number) {
    if (toIdx < 0 || toIdx >= category.items.length) return;
    const next = [...category.items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onReorderItems(next);
  }

  function handleDragStart(idx: number) {
    dragIndexRef.current = idx;
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOver(idx);
  }

  function handleDrop(idx: number) {
    const from = dragIndexRef.current;
    if (from !== null && from !== idx) moveItem(from, idx);
    dragIndexRef.current = null;
    setDragOver(null);
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    setDragOver(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Category header */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              className="flex-1 font-semibold text-slate-900 bg-transparent border-b border-emerald-400 focus:outline-none"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") saveNameLocal(); if (e.key === "Escape") setEditingName(false); }}
            />
            <button onClick={saveNameLocal} className="p-1 text-emerald-600"><Check className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{category.name}</h3>
            <button onClick={() => setEditingName(true)} className="p-1 text-slate-300 hover:text-slate-600 rounded">
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{category.items.length} piatti</span>
          <button onClick={onDeleteCategory} className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-slate-50">
        {category.items.map((item, idx) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={handleDragEnd}
            className={`transition-colors ${dragOver === idx ? "bg-emerald-50" : ""}`}
          >
            <ItemRow
              item={item}
              businessId={businessId}
              idx={idx}
              total={category.items.length}
              onUpdate={(updates) => onUpdateItem(item.id, updates)}
              onDelete={() => onDeleteItem(item.id)}
              onMoveUp={() => moveItem(idx, idx - 1)}
              onMoveDown={() => moveItem(idx, idx + 1)}
            />
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-slate-50">
        <button onClick={onAddItem} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Aggiungi piatto
        </button>
      </div>
    </div>
  );
}

// ── ItemRow ────────────────────────────────────────────────────────────────────

function ItemRow({
  item, businessId, idx, total,
  onUpdate, onDelete, onMoveUp, onMoveDown,
}: {
  item: Item;
  businessId: string;
  idx: number;
  total: number;
  onUpdate: (updates: Partial<Item>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localName, setLocalName] = useState(item.name);
  const [localDesc, setLocalDesc] = useState(item.description || "");
  const [localPrice, setLocalPrice] = useState(item.price?.toString() || "");
  const [localTags, setLocalTags] = useState<ItemTag[]>(item.tags ?? []);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(item.photo_url ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // keep in sync if parent reorders
  void businessId;

  function toggleTag(key: ItemTag) {
    setLocalTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  }

  function saveLocal() {
    onUpdate({ name: localName, description: localDesc || null, price: localPrice ? parseFloat(localPrice) : null, tags: localTags });
    setEditing(false);
    setShowTagPicker(false);
  }

  async function handlePhotoUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    setUploadingPhoto(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadingPhoto(false); return; }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${item.id}.${ext}`;
    const { error } = await supabase.storage.from("menu-photos").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("menu-photos").getPublicUrl(path);
      const url = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("items").update({ photo_url: url }).eq("id", item.id);
      setPhotoUrl(url);
      onUpdate({ photo_url: url });
    }
    setUploadingPhoto(false);
  }

  async function removePhoto() {
    const supabase = createClient();
    await supabase.from("items").update({ photo_url: null }).eq("id", item.id);
    setPhotoUrl(null);
    onUpdate({ photo_url: null });
  }

  return (
    <div className="px-4 py-3 group flex gap-2 items-start">
      {/* ── Drag handle + arrow buttons ── */}
      {!editing && (
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={idx === 0}
            className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Sposta su"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <div className="cursor-grab active:cursor-grabbing text-slate-200 hover:text-slate-400 transition-colors" title="Trascina per riordinare">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <button
            onClick={onMoveDown}
            disabled={idx === total - 1}
            className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Sposta giù"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              {/* Photo in edit mode */}
              <div className="flex-shrink-0">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }}
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-emerald-400 transition-colors flex items-center justify-center bg-slate-50"
                >
                  {photoUrl
                    ? <img src={photoUrl} alt="" className="object-cover w-full h-full" /> // eslint-disable-line @next/next/no-img-element
                    : <Camera className="w-5 h-5 text-slate-300" />
                  }
                </button>
                {uploadingPhoto && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-emerald-600">Carico...</span>
                  </div>
                )}
                {photoUrl && !uploadingPhoto && (
                  <button onClick={removePhoto} className="mt-1 text-xs text-red-400 hover:underline w-full text-center block">Rimuovi</button>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    className="flex-1 text-sm font-medium text-slate-900 border-b border-emerald-400 focus:outline-none bg-transparent pb-0.5"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    autoFocus
                    placeholder="Nome piatto"
                  />
                  <input
                    className="w-20 text-sm text-right text-slate-700 border-b border-emerald-400 focus:outline-none bg-transparent pb-0.5"
                    value={localPrice}
                    type="number"
                    step="0.01"
                    min="0"
                    onChange={(e) => setLocalPrice(e.target.value)}
                    placeholder="€"
                  />
                </div>
                <input
                  className="w-full text-xs text-slate-500 border-b border-slate-200 focus:border-emerald-300 focus:outline-none bg-transparent pb-0.5"
                  value={localDesc}
                  onChange={(e) => setLocalDesc(e.target.value)}
                  placeholder="Descrizione (opzionale)"
                />
              </div>
            </div>

            {/* Tag editor */}
            <div>
              <button
                type="button"
                onClick={() => setShowTagPicker((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showTagPicker ? "rotate-180" : ""}`} />
                Allergeni e tag
                {localTags.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{localTags.length}</span>
                )}
              </button>

              {showTagPicker && (
                <div className="mt-3 space-y-3">
                  {(["allergen", "status", "dietary", "quality"] as const).map((cat) => {
                    const catTags = ALL_TAGS.filter((t) => t.category === cat);
                    const catLabel = { allergen: "🌾 Allergeni EU", status: "❄️ Stato prodotto", dietary: "🌱 Dieta", quality: "⭐ Qualità" }[cat];
                    return (
                      <div key={cat}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{catLabel}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {catTags.map((tag) => {
                            const active = localTags.includes(tag.key as ItemTag);
                            return (
                              <button
                                key={tag.key}
                                type="button"
                                onClick={() => toggleTag(tag.key as ItemTag)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all border ${
                                  active
                                    ? TAG_CATEGORY_STYLES[tag.category]
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                }`}
                              >
                                <span>{tag.icon}</span>
                                <span>{getTagLabel(tag, "it")}</span>
                                {active && <X className="w-2.5 h-2.5 ml-0.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={saveLocal} className="text-xs text-emerald-600 font-medium hover:underline">Salva</button>
              <button onClick={() => { setEditing(false); setShowTagPicker(false); }} className="text-xs text-slate-400 hover:underline">Annulla</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {photoUrl && (
              <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="" className="object-cover w-full h-full" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                {item.tags?.length > 0 && (
                  <div className="flex gap-1 flex-shrink-0">
                    {item.tags.slice(0, 2).map((tag) => <TagBadge key={tag} tag={tag} />)}
                  </div>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">{item.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm font-semibold text-slate-700">{formatPrice(item.price)}</span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(true)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
