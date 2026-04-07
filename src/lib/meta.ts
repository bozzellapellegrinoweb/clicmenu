/**
 * Meta Conversions API (CAPI) — server-side event tracking
 * Pixel ID: 1440770307277416
 *
 * Events tracked:
 * - PageView       → ogni pagina visitata
 * - ViewContent    → landing page
 * - CompleteRegistration → signup completato
 * - StartTrial     → trial avviato dopo onboarding
 * - Purchase       → abbonamento acquistato (€37)
 */

import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID ?? "1440770307277416";
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;
const API_VERSION = "v19.0";
const ENDPOINT = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface UserData {
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  fbp?: string;   // _fbp cookie
  fbc?: string;   // _fbc cookie
}

interface EventData {
  eventName: string;
  eventSourceUrl?: string;
  userData?: UserData;
  customData?: Record<string, unknown>;
  eventId?: string; // for deduplication with browser pixel
}

async function sendEvent(events: EventData[]) {
  if (!ACCESS_TOKEN) {
    console.warn("[Meta CAPI] TOKEN non configurato, evento skippato");
    return;
  }

  const payload = {
    data: events.map((e) => ({
      event_name: e.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: e.eventId ?? crypto.randomUUID(),
      action_source: "website",
      event_source_url: e.eventSourceUrl,
      user_data: {
        em: e.userData?.email ? [sha256(e.userData.email)] : [],
        client_ip_address: e.userData?.ipAddress,
        client_user_agent: e.userData?.userAgent,
        fbp: e.userData?.fbp,
        fbc: e.userData?.fbc,
      },
      custom_data: e.customData,
    })),
    access_token: ACCESS_TOKEN,
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[Meta CAPI] Error:", res.status, err);
    }
  } catch (err) {
    console.error("[Meta CAPI] Fetch error:", err);
  }
}

// ─── Exported event helpers ───────────────────────────────────────────────────

export function trackPageView(opts: { url: string; userData?: UserData }) {
  return sendEvent([{
    eventName: "PageView",
    eventSourceUrl: opts.url,
    userData: opts.userData,
  }]);
}

export function trackViewContent(opts: { url: string; contentName: string; userData?: UserData }) {
  return sendEvent([{
    eventName: "ViewContent",
    eventSourceUrl: opts.url,
    userData: opts.userData,
    customData: {
      content_name: opts.contentName,
      content_type: "product",
      currency: "EUR",
      value: 0,
    },
  }]);
}

export function trackCompleteRegistration(opts: { email: string; url: string; userData?: UserData }) {
  return sendEvent([{
    eventName: "CompleteRegistration",
    eventSourceUrl: opts.url,
    userData: { ...opts.userData, email: opts.email },
    customData: {
      currency: "EUR",
      value: 0,
      status: "registered",
    },
  }]);
}

export function trackStartTrial(opts: { email: string; url: string; userData?: UserData }) {
  return sendEvent([{
    eventName: "StartTrial",
    eventSourceUrl: opts.url,
    userData: { ...opts.userData, email: opts.email },
    customData: {
      currency: "EUR",
      value: 37,           // valore atteso conversione
      predicted_ltv: 37,
    },
  }]);
}

export function trackPurchase(opts: { email: string; url: string; userData?: UserData }) {
  return sendEvent([{
    eventName: "Purchase",
    eventSourceUrl: opts.url,
    userData: { ...opts.userData, email: opts.email },
    customData: {
      currency: "EUR",
      value: 37,
      content_name: "Clicmenu.ai Piano Annuale",
      content_type: "product",
      num_items: 1,
    },
  }]);
}
