import { NextRequest, NextResponse } from "next/server";
import { translateMenu } from "@/lib/anthropic";

const SUPPORTED_LANGS = ["en", "de", "fr", "es", "it"];

export async function POST(req: NextRequest) {
  const { content, targetLang } = await req.json();
  if (!SUPPORTED_LANGS.includes(targetLang)) {
    return NextResponse.json({ error: "Lingua non supportata" }, { status: 400 });
  }
  if (targetLang === "it") return NextResponse.json({ content }); // nessuna traduzione necessaria
  const translated = await translateMenu(content, targetLang);
  return NextResponse.json({ content: translated });
}
