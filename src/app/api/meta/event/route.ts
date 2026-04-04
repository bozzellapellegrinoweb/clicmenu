import { NextRequest, NextResponse } from "next/server";
import {
  trackPageView,
  trackViewContent,
  trackCompleteRegistration,
  trackStartTrial,
} from "@/lib/meta";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, url, contentName } = body;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? undefined;
  const ua = req.headers.get("user-agent") ?? undefined;
  const fbp = req.cookies.get("_fbp")?.value;
  const fbc = req.cookies.get("_fbc")?.value;
  const userData = { ipAddress: ip, userAgent: ua, fbp, fbc };

  // Get email if logged in (for better match rate)
  let email: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email ?? undefined;
  } catch { /* not logged in */ }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clicmenu.ai";
  const fullUrl = url ? `${appUrl}${url}` : appUrl;

  switch (type) {
    case "PageView":
      await trackPageView({ url: fullUrl, userData });
      break;
    case "ViewContent":
      await trackViewContent({ url: fullUrl, contentName: contentName ?? "Landing Page", userData });
      break;
    case "CompleteRegistration":
      if (email) await trackCompleteRegistration({ email, url: fullUrl, userData });
      break;
    case "StartTrial":
      if (email) await trackStartTrial({ email, url: fullUrl, userData });
      break;
    default:
      return NextResponse.json({ error: "Evento non valido" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
