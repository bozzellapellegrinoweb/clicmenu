import { NextRequest, NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendTrialEndingEmail,
} from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { type, ...params } = await req.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clicmenu.ai";

  try {
    if (type === "welcome") {
      await sendWelcomeEmail(user.email!, params.name ?? "Ciao", appUrl);
    } else if (type === "trial_ending") {
      await sendTrialEndingEmail(user.email!, params.name ?? "Ciao", params.daysLeft ?? 3, appUrl);
    } else {
      return NextResponse.json({ error: "Tipo email non valido" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Email error:", e);
    return NextResponse.json({ error: "Errore invio email" }, { status: 500 });
  }
}
