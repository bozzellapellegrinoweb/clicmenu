/**
 * Converts a string to a URL-friendly slug.
 * "Menu Pranzo" → "menu-pranzo"
 * "Carta dei Vini" → "carta-dei-vini"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, "-")            // spaces to dashes
    .replace(/-+/g, "-");            // collapse multiple dashes
}
