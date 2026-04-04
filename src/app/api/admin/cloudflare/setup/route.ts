import { createClient } from "@/lib/supabase/server";
import { createWildcardSubdomain, listDnsRecords } from "@/lib/cloudflare";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = ["info@clicmenu.ai"];

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await listDnsRecords();
    const hasWildcard = existing.result?.some(
      (r: { type: string; name: string }) => r.type === "CNAME" && r.name === "*.clicmenu.ai"
    );

    if (hasWildcard) {
      return NextResponse.json({ message: "Wildcard DNS già presente", existing: true });
    }

    const result = await createWildcardSubdomain("clicmenu.ai");
    return NextResponse.json({ message: "Wildcard DNS *.clicmenu.ai creato", result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
