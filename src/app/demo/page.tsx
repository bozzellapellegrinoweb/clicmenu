/**
 * Demo statica della Pizzeria Da Mario
 * Visibile senza Supabase — dati hardcoded
 * URL: http://localhost:3030/demo
 */
import { PublicMenuView } from "@/components/public-menu/public-menu-view";
import type { Business, Menu, Category, Item, ItemTag } from "@/types";

const business: Business = {
  id: "demo-business",
  user_id: "demo-user",
  name: "Pizzeria Da Mario",
  type: "restaurant",
  slug: "pizzeria-da-mario",
  logo_url: null,
  address: "Via Roma 42, Napoli",
  phone: "+39 081 1234567",
  created_at: new Date().toISOString(),
};

function item(id: string, catId: string, name: string, description: string, price: number, tags: ItemTag[] = [], sort_order = 0): Item {
  return { id, category_id: catId, name, description, price, currency: "EUR", photo_url: null, tags, is_available: true, sort_order, created_at: new Date().toISOString() };
}

const antipastiId = "cat-1";
const primiId = "cat-2";
const pizzeId = "cat-3";
const secondiId = "cat-4";
const contorniId = "cat-5";
const dolciId = "cat-6";

const categories: (Category & { items: Item[] })[] = [
  {
    id: antipastiId,
    menu_id: "menu-1",
    name: "Antipasti",
    description: "Per iniziare alla grande",
    sort_order: 1,
    created_at: new Date().toISOString(),
    items: [
      item("a1", antipastiId, "Bruschetta al Pomodoro", "Pane casereccio tostato con pomodoro fresco, basilico e olio EVO", 6.5, ["vegano"], 1),
      item("a2", antipastiId, "Carpaccio di Manzo", "Fettine sottili di manzo, rucola, scaglie di Parmigiano e limone", 12, [], 2),
      item("a3", antipastiId, "Frittura di Paranza", "Gamberi, calamari e alici fritti con limone e maionese homemade", 14, [], 3),
      item("a4", antipastiId, "Burrata con Prosciutto Crudo", "Burrata fresca pugliese, prosciutto di Parma 24 mesi, pomodorini", 13, ["senza glutine"], 4),
    ],
  },
  {
    id: primiId,
    menu_id: "menu-1",
    name: "Primi Piatti",
    description: "Pasta fresca fatta in casa ogni giorno",
    sort_order: 2,
    created_at: new Date().toISOString(),
    items: [
      item("p1", primiId, "Spaghetti alle Vongole", "Spaghetti di Gragnano, vongole veraci, aglio, prezzemolo e vino bianco", 16, [], 1),
      item("p2", primiId, "Paccheri al Ragù Napoletano", "Paccheri al forno con ragù lento 5 ore, fior di latte e basilico", 14, [], 2),
      item("p3", primiId, "Risotto ai Funghi Porcini", "Riso Carnaroli, porcini freschi di stagione, burro di montagna e Parmigiano", 15, ["vegetariano", "senza glutine"], 3),
      item("p4", primiId, "Cacio e Pepe", "Tonnarelli freschi, pecorino Romano DOP, pepe nero macinato al momento", 13, ["vegetariano"], 4),
    ],
  },
  {
    id: pizzeId,
    menu_id: "menu-1",
    name: "Le Nostre Pizze",
    description: "Impasto a 48h di lievitazione naturale, cotto nel forno a legna",
    sort_order: 3,
    created_at: new Date().toISOString(),
    items: [
      item("pz1", pizzeId, "Margherita", "Pomodoro San Marzano DOP, fior di latte di Agerola, basilico fresco, olio EVO", 9, ["vegetariano"], 1),
      item("pz2", pizzeId, "Marinara", "Pomodoro San Marzano, aglio, origano, olio EVO — la pizza più antica di Napoli", 7.5, ["vegano", "vegetariano"], 2),
      item("pz3", pizzeId, "Diavola", "Fior di latte, salame piccante calabrese, peperoncino, pomodoro", 11, ["piccante"], 3),
      item("pz4", pizzeId, "Quattro Stagioni", "Carciofi, funghi, prosciutto cotto, olive nere, fior di latte", 13, [], 4),
      item("pz5", pizzeId, "Bufala e Prosciutto Crudo", "Mozzarella di bufala campana DOP, prosciutto di Parma, rucola, Parmigiano", 15, [], 5),
      item("pz6", pizzeId, "Pistacchio e Salsiccia", "Base bianca, fior di latte, salsiccia artigianale, crema di pistacchio di Bronte", 14, [], 6),
      item("pz7", pizzeId, "Vegana del Orto", "Pomodoro, verdure grigliate di stagione, pesto di basilico, olive Taggiasche", 12, ["vegano", "vegetariano"], 7),
    ],
  },
  {
    id: secondiId,
    menu_id: "menu-1",
    name: "Secondi",
    description: "Carne e pesce della tradizione",
    sort_order: 4,
    created_at: new Date().toISOString(),
    items: [
      item("s1", secondiId, "Branzino al Forno", "Branzino intero arrosto con patate, olive, capperi e pomodorini", 22, ["senza glutine"], 1),
      item("s2", secondiId, "Tagliata di Manzo", "Controfiletto 300g alla griglia, rucola, scaglie di Grana Padano, aceto balsamico", 24, ["senza glutine"], 2),
      item("s3", secondiId, "Pollo alla Cacciatora", "Pollo nostrano con peperoni, olive, capperi, pomodoro e vino bianco", 18, ["senza glutine"], 3),
    ],
  },
  {
    id: contorniId,
    menu_id: "menu-1",
    name: "Contorni",
    description: null,
    sort_order: 5,
    created_at: new Date().toISOString(),
    items: [
      item("c1", contorniId, "Patatine Fritte", "Patate fresche tagliate al momento, olio di girasole, sale marino", 5, ["vegano", "vegetariano"], 1),
      item("c2", contorniId, "Verdure Grigliate", "Mix stagionale di zucchine, melanzane, peperoni grigliati con erbe aromatiche", 7, ["vegano", "vegetariano", "senza glutine"], 2),
      item("c3", contorniId, "Insalata Mista", "Rucola, valeriana, pomodorini, carote, finocchio", 6, ["vegano", "vegetariano", "senza glutine"], 3),
    ],
  },
  {
    id: dolciId,
    menu_id: "menu-1",
    name: "Dolci",
    description: "Preparati artigianalmente ogni mattina",
    sort_order: 6,
    created_at: new Date().toISOString(),
    items: [
      item("d1", dolciId, "Tiramisù Classico", "Ricetta tradizionale con savoiardi, mascarpone, caffè espresso e cacao", 7, ["vegetariano"], 1),
      item("d2", dolciId, "Babà al Rum", "Babà napoletano artigianale imbevuto nel rum jamaicano, crema chantilly", 6, ["vegetariano"], 2),
      item("d3", dolciId, "Panna Cotta ai Frutti di Bosco", "Panna cotta alla vaniglia del Madagascar, coulis di lamponi e mirtilli", 6.5, ["vegetariano", "senza glutine"], 3),
      item("d4", dolciId, "Gelato Artigianale (3 palline)", "Scegli tra: fiordilatte, pistacchio di Bronte, cioccolato fondente, fragola, limone", 5, ["vegetariano", "senza glutine"], 4),
    ],
  },
];

const menu: Menu & { categories: (Category & { items: Item[] })[] } = {
  id: "menu-1",
  business_id: "demo-business",
  name: "Menu Ristorante",
  is_active: true,
  is_published: true,
  published_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  categories,
};

export default function DemoPage() {
  return <PublicMenuView business={business} menus={[menu]} />;
}
