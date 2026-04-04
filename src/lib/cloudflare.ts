/**
 * Cloudflare DNS API utility
 * Zone: clicmenu.ai
 */

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID ?? "f588075f88d2c04139d82951dd0d9498";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const BASE = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}`;

async function cfFetch(path: string, options: RequestInit = {}) {
  if (!API_TOKEN) throw new Error("CLOUDFLARE_API_TOKEN not set");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  return res.json();
}

/** List all DNS records */
export async function listDnsRecords() {
  return cfFetch("/dns_records?per_page=100");
}

/**
 * Create wildcard CNAME *.clicmenu.ai → clicmenu.ai (proxied)
 * This enables any {business}.clicmenu.ai subdomain automatically.
 */
export async function createWildcardSubdomain(target: string = "clicmenu.ai") {
  return cfFetch("/dns_records", {
    method: "POST",
    body: JSON.stringify({
      type: "CNAME",
      name: "*",
      content: target,
      ttl: 1, // Auto TTL
      proxied: true,
    }),
  });
}

/**
 * Delete a DNS record by ID.
 */
export async function deleteDnsRecord(recordId: string) {
  return cfFetch(`/dns_records/${recordId}`, { method: "DELETE" });
}
