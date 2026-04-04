export type BusinessType =
  | "restaurant"
  | "spa"
  | "bar"
  | "hotel"
  | "cafe"
  | "pizzeria"
  | "other";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "incomplete";

export interface Business {
  id: string;
  user_id: string;
  name: string;
  type: BusinessType;
  slug: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface Menu {
  id: string;
  business_id: string;
  name: string;
  is_active: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  menu_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export type ItemTag =
  // Allergeni EU 1169/2011
  | "glutine"
  | "crostacei"
  | "uova"
  | "pesce"
  | "arachidi"
  | "soia"
  | "latte"
  | "frutta a guscio"
  | "sedano"
  | "senape"
  | "sesamo"
  | "solfiti"
  | "lupini"
  | "molluschi"
  // Status
  | "surgelato"
  // Dieta
  | "vegano"
  | "vegetariano"
  | "senza glutine"
  | "senza lattosio"
  | "piccante"
  // Qualità
  | "biologico"
  | "dop"
  | "igp"
  | "km0"
  | "consigliato"
  | "novità";

export interface Item {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  photo_url: string | null;
  tags: ItemTag[];
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  expires_at: string | null;
  created_at: string;
}

// AI Extraction types
export interface ExtractedItem {
  name: string;
  description: string | null;
  price: number | null;
  tags: ItemTag[];
}

export interface ExtractedCategory {
  name: string;
  items: ExtractedItem[];
}

export interface ExtractedMenu {
  categories: ExtractedCategory[];
}

// Full menu with nested data (for public page)
export interface MenuWithData extends Menu {
  business: Business;
  categories: CategoryWithItems[];
}

export interface CategoryWithItems extends Category {
  items: Item[];
}
