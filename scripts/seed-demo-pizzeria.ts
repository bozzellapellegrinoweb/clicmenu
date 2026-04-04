/**
 * Seed script — Demo ARES AI
 * Crea utenti demo pronti per testare la piattaforma
 *
 * Credenziali create:
 *   Super Admin:  admin@aresai.io       / AresAdmin2024!
 *   Pizzeria:     demo@pizzeriadamario.it / demo1234
 *
 * Run: cd /Users/pbmacmini/aresai && npx tsx scripts/seed-demo-pizzeria.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? "http://127.0.0.1:55321",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

// ─── helpers ────────────────────────────────────────────────────────────────

async function createOrGetUser(email: string, password: string, meta?: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta ?? {},
  });
  if (data?.user) return data.user;
  if (error?.message?.toLowerCase().includes("already")) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    return list?.users?.find((u) => u.email === email) ?? null;
  }
  console.error(`Auth error (${email}):`, error?.message);
  process.exit(1);
}

// ─── seed ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding ARES AI demo data...\n");

  // ── 1. Super Admin ─────────────────────────────────────────────────────────
  const adminUser = await createOrGetUser(
    "admin@aresai.io",
    "AresAdmin2024!",
    { role: "admin" }
  );
  if (adminUser) {
    await supabaseAdmin.from("subscriptions").upsert(
      { user_id: adminUser.id, status: "active" },
      { onConflict: "user_id" }
    );
    console.log("✓ Super Admin creato:", adminUser.email);
  }

  // ── 2. Pizzeria Da Mario ───────────────────────────────────────────────────
  const pizzaUser = await createOrGetUser(
    "demo@pizzeriadamario.it",
    "demo1234"
  );
  if (!pizzaUser) { console.error("Errore utente pizzeria"); process.exit(1); }
  console.log("✓ Utente pizzeria creato:", pizzaUser.email);

  // Business
  const { data: business, error: bizError } = await supabaseAdmin
    .from("businesses")
    .upsert({
      user_id: pizzaUser.id,
      name: "Pizzeria Da Mario",
      type: "restaurant",
      slug: "pizzeria-da-mario",
      address: "Via Roma 42, Napoli",
      phone: "+39 081 1234567",
    }, { onConflict: "slug" })
    .select()
    .single();

  if (bizError) { console.error("Business error:", bizError.message); process.exit(1); }
  console.log("✓ Business:", business.name);

  await supabaseAdmin.from("subscriptions").upsert(
    { user_id: pizzaUser.id, status: "active" },
    { onConflict: "user_id" }
  );
  console.log("✓ Subscription attiva");

  // Menu
  const { data: menu, error: menuError } = await supabaseAdmin
    .from("menus")
    .insert({
      business_id: business.id,
      name: "Menu Pizze e Cucina",
      is_active: true,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (menuError) { console.error("Menu error:", menuError.message); process.exit(1); }
  console.log("✓ Menu:", menu.name);

  // Categorie + piatti
  const menuData = [
    {
      name: "Antipasti",
      items: [
        { name: "Bruschetta al Pomodoro", description: "Pane casereccio tostato, pomodori freschi, basilico e olio EVO", price: 5.50, tags: ["vegan", "vegetariano"] },
        { name: "Burrata con Prosciutto", description: "Burrata pugliese DOP con prosciutto crudo di Parma 24 mesi", price: 11.00, tags: [] },
        { name: "Frittura Mista", description: "Frittura di verdure e mozzarelline in carrozza", price: 9.00, tags: ["vegetariano"] },
        { name: "Tagliere di Salumi", description: "Selezione di salumi artigianali con grissini fatti in casa", price: 12.00, tags: [] },
      ],
    },
    {
      name: "Pizze Classiche",
      items: [
        { name: "Margherita", description: "Pomodoro San Marzano, fior di latte, basilico fresco", price: 8.00, tags: ["vegetariano"] },
        { name: "Marinara", description: "Pomodoro San Marzano, aglio, origano, olio EVO", price: 6.50, tags: ["vegan", "vegetariano"] },
        { name: "Diavola", description: "Pomodoro, fior di latte, salame piccante calabrese", price: 10.50, tags: ["piccante"] },
        { name: "Prosciutto e Funghi", description: "Pomodoro, fior di latte, prosciutto cotto, funghi champignon", price: 11.00, tags: [] },
        { name: "Quattro Stagioni", description: "Pomodoro, fior di latte, prosciutto, funghi, carciofi, olive", price: 12.50, tags: [] },
        { name: "Capricciosa", description: "Pomodoro, fior di latte, prosciutto, funghi, carciofi, olive, uovo", price: 13.00, tags: [] },
      ],
    },
    {
      name: "Pizze Speciali",
      items: [
        { name: "Pizza dello Chef", description: "Crema di zucca, salsiccia artigianale, provola affumicata, scaglie di parmigiano", price: 15.00, tags: ["consigliato"] },
        { name: "Tartufo e Burrata", description: "Base bianca, crema al tartufo nero, burrata fresca, rucola e scaglie di grana", price: 17.50, tags: ["vegetariano", "consigliato"] },
        { name: "Nduja e Stracciatella", description: "Pomodoro, nduja piccante di Spilinga, stracciatella di bufala, basilico", price: 14.00, tags: ["piccante"] },
        { name: "Gluten Free Margherita", description: "Base senza glutine, pomodoro, fior di latte, basilico", price: 13.00, tags: ["senza glutine", "vegetariano"] },
        { name: "Vegan Primavera", description: "Pomodoro, verdure grigliate, hummus, olio al basilico", price: 12.00, tags: ["vegan", "vegetariano"] },
      ],
    },
    {
      name: "Primi Piatti",
      items: [
        { name: "Spaghetti al Pomodoro", description: "Spaghetti trafilati al bronzo, pomodorini del Piennolo, basilico", price: 9.00, tags: ["vegan", "vegetariano"] },
        { name: "Rigatoni all'Amatriciana", description: "Rigatoni, guanciale di Norcia, pecorino romano, pomodoro", price: 12.00, tags: [] },
        { name: "Pasta alla Norma", description: "Penne, melanzane fritte, pomodoro, ricotta salata, basilico", price: 10.50, tags: ["vegetariano"] },
      ],
    },
    {
      name: "Dolci",
      items: [
        { name: "Tiramisù della Casa", description: "Ricetta originale con mascarpone, savoiardi e caffè espresso", price: 6.00, tags: ["consigliato"] },
        { name: "Cannolo Siciliano", description: "Croccante cialda fritta con ricotta di pecora, scaglie di cioccolato", price: 5.50, tags: [] },
        { name: "Panna Cotta", description: "Panna cotta con coulis di frutti di bosco freschi", price: 5.00, tags: ["vegetariano"] },
        { name: "Gelato Artigianale", description: "Due gusti a scelta: cioccolato, pistacchio, fragola, nocciola, limone", price: 4.50, tags: ["vegetariano"] },
      ],
    },
    {
      name: "Bevande",
      items: [
        { name: "Acqua Naturale 0,5L", description: null, price: 1.50, tags: ["vegan"] },
        { name: "Acqua Frizzante 0,5L", description: null, price: 1.50, tags: ["vegan"] },
        { name: "Coca-Cola 33cl", description: null, price: 3.00, tags: [] },
        { name: "Birra Moretti 33cl", description: null, price: 4.00, tags: [] },
        { name: "Birra artigianale alla spina", description: "Birra chiara artigianale locale, 40cl", price: 5.50, tags: [] },
        { name: "Vino della Casa", description: "Carafa da 0,5L, rosso o bianco", price: 7.00, tags: [] },
        { name: "Limonata fresca", description: "Limoni di Sicilia, acqua frizzante, menta", price: 4.00, tags: ["vegan"] },
      ],
    },
  ];

  for (let i = 0; i < menuData.length; i++) {
    const cat = menuData[i];
    const { data: category, error: catError } = await supabaseAdmin
      .from("categories")
      .insert({ menu_id: menu.id, name: cat.name, sort_order: i })
      .select()
      .single();

    if (catError) { console.error("Category error:", catError.message); continue; }

    const items = cat.items.map((item, j) => ({
      category_id: category.id,
      name: item.name,
      description: item.description ?? null,
      price: item.price,
      tags: item.tags,
      sort_order: j,
      is_available: true,
    }));

    const { error: itemsError } = await supabaseAdmin.from("items").insert(items);
    if (itemsError) console.error("Items error:", itemsError.message);
    else console.log(`  ✓ ${cat.name} (${items.length} piatti)`);
  }

  console.log(`
╔══════════════════════════════════════════════════════╗
║           ARES AI — CREDENZIALI DEMO                 ║
╠══════════════════════════════════════════════════════╣
║  SUPER ADMIN                                         ║
║    Email:    admin@aresai.io                         ║
║    Password: AresAdmin2024!                          ║
║    URL:      http://localhost:3030/admin             ║
╠══════════════════════════════════════════════════════╣
║  PIZZERIA DA MARIO (ristoratore)                     ║
║    Email:    demo@pizzeriadamario.it                 ║
║    Password: demo1234                                ║
║    Dashboard: http://localhost:3030/dashboard        ║
║    Menu pub.: http://localhost:3030/m/pizzeria-da-mario
╚══════════════════════════════════════════════════════╝
`);
}

seed().catch(console.error);
