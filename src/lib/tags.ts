/**
 * Sistema tag completo per Clicmenu.ai
 *
 * Fonti normative:
 * - Reg. UE 1169/2011 — 14 allergeni obbligatori per la ristorazione
 * - D.Lgs. 109/1992 e Reg. UE 1169/2011 Art.17 — obbligo "decongelato/surgelato"
 * - Reg. UE 834/2007 — uso protetto del termine "biologico"
 */

export type TagCategory = "allergen" | "dietary" | "status" | "quality";

export type SupportedLang = "it" | "en" | "de" | "fr" | "es";

export interface TagDef {
  /** chiave normalizzata usata nel DB e dall'AI */
  key: string;
  /** alias che l'AI può riconoscere nel testo del menu */
  aliases: string[];
  /** emoji icona */
  icon: string;
  /** etichette nelle lingue supportate */
  labels: Record<SupportedLang, string>;
  category: TagCategory;
}

export const ALL_TAGS: TagDef[] = [
  // ── 14 Allergeni EU 1169/2011 ────────────────────────────────────────
  {
    key: "glutine",
    aliases: ["glutine", "gluten", "frumento", "grano", "orzo", "segale", "avena", "farro", "kamut", "contiene glutine"],
    icon: "🌾",
    labels: { it: "Glutine", en: "Gluten", de: "Gluten", fr: "Gluten", es: "Gluten" },
    category: "allergen",
  },
  {
    key: "crostacei",
    aliases: ["crostacei", "crustaceans", "gamberetti", "gamberi", "aragosta", "granchio"],
    icon: "🦐",
    labels: { it: "Crostacei", en: "Crustaceans", de: "Krebstiere", fr: "Crustacés", es: "Crustáceos" },
    category: "allergen",
  },
  {
    key: "uova",
    aliases: ["uova", "uovo", "eggs", "egg"],
    icon: "🥚",
    labels: { it: "Uova", en: "Eggs", de: "Eier", fr: "Œufs", es: "Huevos" },
    category: "allergen",
  },
  {
    key: "pesce",
    aliases: ["pesce", "fish", "acciughe", "alici", "baccalà", "salmone", "tonno"],
    icon: "🐟",
    labels: { it: "Pesce", en: "Fish", de: "Fisch", fr: "Poisson", es: "Pescado" },
    category: "allergen",
  },
  {
    key: "arachidi",
    aliases: ["arachidi", "peanuts", "arachide"],
    icon: "🥜",
    labels: { it: "Arachidi", en: "Peanuts", de: "Erdnüsse", fr: "Arachides", es: "Cacahuetes" },
    category: "allergen",
  },
  {
    key: "soia",
    aliases: ["soia", "soy", "soya", "soybean"],
    icon: "🫘",
    labels: { it: "Soia", en: "Soy", de: "Soja", fr: "Soja", es: "Soja" },
    category: "allergen",
  },
  {
    key: "latte",
    aliases: ["latte", "milk", "dairy", "lattosio", "formaggio", "mozzarella", "burro", "panna", "yogurt"],
    icon: "🥛",
    labels: { it: "Latte", en: "Milk", de: "Milch", fr: "Lait", es: "Leche" },
    category: "allergen",
  },
  {
    key: "frutta a guscio",
    aliases: ["frutta a guscio", "nuts", "mandorle", "nocciole", "noci", "anacardi", "pistacchi", "mandorla", "noce"],
    icon: "🌰",
    labels: { it: "Frutta a guscio", en: "Tree nuts", de: "Schalenfrüchte", fr: "Fruits à coque", es: "Frutos de cáscara" },
    category: "allergen",
  },
  {
    key: "sedano",
    aliases: ["sedano", "celery", "sedano rapa"],
    icon: "🥬",
    labels: { it: "Sedano", en: "Celery", de: "Sellerie", fr: "Céleri", es: "Apio" },
    category: "allergen",
  },
  {
    key: "senape",
    aliases: ["senape", "mustard"],
    icon: "🌼",
    labels: { it: "Senape", en: "Mustard", de: "Senf", fr: "Moutarde", es: "Mostaza" },
    category: "allergen",
  },
  {
    key: "sesamo",
    aliases: ["sesamo", "sesame", "semi di sesamo", "tahini"],
    icon: "🌿",
    labels: { it: "Sesamo", en: "Sesame", de: "Sesam", fr: "Sésame", es: "Sésamo" },
    category: "allergen",
  },
  {
    key: "solfiti",
    aliases: ["solfiti", "sulphites", "sulfites", "anidride solforosa", "so2"],
    icon: "🍷",
    labels: { it: "Solfiti", en: "Sulphites", de: "Sulfite", fr: "Sulfites", es: "Sulfitos" },
    category: "allergen",
  },
  {
    key: "lupini",
    aliases: ["lupini", "lupin", "lupino"],
    icon: "🌸",
    labels: { it: "Lupini", en: "Lupin", de: "Lupinen", fr: "Lupin", es: "Altramuces" },
    category: "allergen",
  },
  {
    key: "molluschi",
    aliases: ["molluschi", "molluscs", "mollusks", "calamari", "polpo", "seppia", "vongole", "cozze", "ostriche"],
    icon: "🐚",
    labels: { it: "Molluschi", en: "Molluscs", de: "Weichtiere", fr: "Mollusques", es: "Moluscos" },
    category: "allergen",
  },

  // ── Obbligo italiano: prodotto surgelato/decongelato ─────────────────
  {
    key: "surgelato",
    aliases: ["surgelato", "congelato", "frozen", "decongelato", "precedentemente congelato", "abbattuto"],
    icon: "❄️",
    labels: { it: "Surgelato", en: "Frozen", de: "Tiefgefroren", fr: "Surgelé", es: "Congelado" },
    category: "status",
  },

  // ── Dieta ─────────────────────────────────────────────────────────────
  {
    key: "vegano",
    aliases: ["vegano", "vegan", "100% vegetale"],
    icon: "🌱",
    labels: { it: "Vegano", en: "Vegan", de: "Vegan", fr: "Végane", es: "Vegano" },
    category: "dietary",
  },
  {
    key: "vegetariano",
    aliases: ["vegetariano", "vegetarian", "vegetariana"],
    icon: "🥦",
    labels: { it: "Vegetariano", en: "Vegetarian", de: "Vegetarisch", fr: "Végétarien", es: "Vegetariano" },
    category: "dietary",
  },
  {
    key: "senza glutine",
    aliases: ["senza glutine", "gluten free", "gluten-free", "senza frumento", "gf"],
    icon: "✅",
    labels: { it: "Senza glutine", en: "Gluten-free", de: "Glutenfrei", fr: "Sans gluten", es: "Sin gluten" },
    category: "dietary",
  },
  {
    key: "senza lattosio",
    aliases: ["senza lattosio", "lactose free", "lactose-free", "senza latte"],
    icon: "🆓",
    labels: { it: "Senza lattosio", en: "Lactose-free", de: "Laktosefrei", fr: "Sans lactose", es: "Sin lactosa" },
    category: "dietary",
  },
  {
    key: "piccante",
    aliases: ["piccante", "spicy", "hot", "peperoncino", "molto piccante"],
    icon: "🌶️",
    labels: { it: "Piccante", en: "Spicy", de: "Scharf", fr: "Épicé", es: "Picante" },
    category: "dietary",
  },

  // ── Qualità / marketing ───────────────────────────────────────────────
  {
    key: "biologico",
    aliases: ["biologico", "bio", "organic", "ecologico"],
    icon: "🌿",
    labels: { it: "Bio", en: "Organic", de: "Bio", fr: "Bio", es: "Ecológico" },
    category: "quality",
  },
  {
    key: "dop",
    aliases: ["dop", "d.o.p.", "denominazione di origine protetta"],
    icon: "🏷️",
    labels: { it: "DOP", en: "PDO", de: "g.U.", fr: "AOP", es: "DOP" },
    category: "quality",
  },
  {
    key: "igp",
    aliases: ["igp", "i.g.p.", "indicazione geografica protetta"],
    icon: "🏷️",
    labels: { it: "IGP", en: "PGI", de: "g.g.A.", fr: "IGP", es: "IGP" },
    category: "quality",
  },
  {
    key: "km0",
    aliases: ["km0", "km 0", "a km zero", "prodotto locale", "filiera corta"],
    icon: "📍",
    labels: { it: "Km0", en: "Local", de: "Regional", fr: "Local", es: "Local" },
    category: "quality",
  },
  {
    key: "consigliato",
    aliases: ["consigliato", "chef consiglia", "specialità", "signature", "must try"],
    icon: "⭐",
    labels: { it: "Consigliato", en: "Recommended", de: "Empfohlen", fr: "Recommandé", es: "Recomendado" },
    category: "quality",
  },
  {
    key: "novità",
    aliases: ["novità", "nuovo", "new", "stagionale"],
    icon: "✨",
    labels: { it: "Novità", en: "New", de: "Neu", fr: "Nouveau", es: "Nuevo" },
    category: "quality",
  },
];

/** Colori per categoria tag */
export const TAG_CATEGORY_STYLES: Record<TagCategory, string> = {
  allergen: "bg-red-50 text-red-700 border border-red-200",
  dietary:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  status:   "bg-blue-50 text-blue-700 border border-blue-200",
  quality:  "bg-amber-50 text-amber-700 border border-amber-200",
};

/** Mappa chiave → definizione (lookup veloce) */
export const TAG_MAP: Record<string, TagDef> = Object.fromEntries(
  ALL_TAGS.map((t) => [t.key, t])
);

/** Ottieni la definizione di un tag dalla sua chiave */
export function getTagDef(key: string): TagDef | undefined {
  const normalized = key.toLowerCase().trim();
  return TAG_MAP[normalized] ?? ALL_TAGS.find((t) => t.aliases.includes(normalized));
}

/** Ottieni la label localizzata di un tag */
export function getTagLabel(tag: TagDef, lang: string): string {
  return tag.labels[(lang as SupportedLang)] ?? tag.labels.it;
}

/** Lista di tutte le chiavi valide da passare all'AI nel prompt */
export const VALID_TAG_KEYS = ALL_TAGS.map((t) => t.key);
