import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertGHLContact } from "@/lib/ghl";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ ok: false }, { status: 401 });

  const { name } = await req.json();

  // Split name into first/last (best effort)
  const parts = (name ?? "").trim().split(" ");
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || undefined;

  await upsertGHLContact({
    email: user.email,
    firstName,
    lastName,
    tags: ["iscritto clicmenu"],
  });

  return NextResponse.json({ ok: true });
}
