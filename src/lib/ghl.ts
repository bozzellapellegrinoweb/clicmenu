/**
 * GoHighLevel CRM integration
 * Adds new Clicmenu.ai users as contacts with tag "iscritto clicmenu"
 */

const GHL_API_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function getHeaders() {
  return {
    "Authorization": `Bearer ${process.env.GHL_API_KEY}`,
    "Version": GHL_VERSION,
    "Content-Type": "application/json",
  };
}

interface GHLContactPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  locationId: string;
}

/**
 * Crea o aggiorna un contatto in GoHighLevel.
 * Se il contatto esiste già (stessa email), aggiunge i tag senza duplicati.
 */
export async function upsertGHLContact(payload: Omit<GHLContactPayload, "locationId">) {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId || !process.env.GHL_API_KEY) {
    console.warn("GHL env vars not set, skipping CRM sync");
    return;
  }

  const body: GHLContactPayload = {
    ...payload,
    locationId,
    tags: payload.tags ?? ["iscritto clicmenu"],
  };

  const res = await fetch(`${GHL_API_URL}/contacts/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("GHL upsert contact error:", res.status, err);
    return;
  }

  return res.json();
}

/**
 * Aggiunge tag a un contatto esistente trovato per email.
 */
export async function addTagsToContact(email: string, tags: string[]) {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId || !process.env.GHL_API_KEY) return;

  // Search contact by email
  const search = await fetch(
    `${GHL_API_URL}/contacts/search?email=${encodeURIComponent(email)}&locationId=${locationId}`,
    { headers: getHeaders() }
  );

  if (!search.ok) return;
  const { contacts } = await search.json();
  const contact = contacts?.[0];
  if (!contact) return;

  // Add tags
  await fetch(`${GHL_API_URL}/contacts/${contact.id}/tags`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ tags }),
  });
}
