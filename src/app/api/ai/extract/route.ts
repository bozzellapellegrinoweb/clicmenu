import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractMenuFromImage } from "@/lib/anthropic";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, "image/heic", "image/heif", "application/pdf"];

async function convertHeicToJpeg(buffer: ArrayBuffer): Promise<Buffer> {
  // Dynamic import to avoid issues if native bindings are missing
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const convert = require("heic-convert");
  const result = await convert({
    buffer: Buffer.from(buffer),
    format: "JPEG",
    quality: 0.9,
  });
  return Buffer.from(result);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("image") as File | null;

  if (!file) return NextResponse.json({ error: "Nessun file fornito" }, { status: 400 });

  const maxSize = 20 * 1024 * 1024; // 20MB per PDF
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File troppo grande. Massimo 20MB." }, { status: 400 });
  }

  const fileType = file.type || "";
  const fileName = file.name.toLowerCase();

  // Detect HEIC by extension if MIME type is wrong (browser inconsistency)
  const isHeic = fileType === "image/heic" || fileType === "image/heif" ||
    fileName.endsWith(".heic") || fileName.endsWith(".heif");
  const isPdf = fileType === "application/pdf" || fileName.endsWith(".pdf");
  const isImage = ALLOWED_IMAGE_TYPES.includes(fileType as typeof ALLOWED_IMAGE_TYPES[number]);

  if (!isHeic && !isPdf && !isImage) {
    return NextResponse.json({
      error: "Formato non supportato. Usa JPEG, PNG, WebP, HEIC (iPhone) o PDF."
    }, { status: 400 });
  }

  let bytes = await file.arrayBuffer();
  let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "application/pdf";

  if (isHeic) {
    try {
      const converted = await convertHeicToJpeg(bytes);
      bytes = converted.buffer as ArrayBuffer;
      mediaType = "image/jpeg";
    } catch {
      return NextResponse.json({ error: "Errore conversione HEIC. Prova a esportare la foto come JPEG." }, { status: 400 });
    }
  } else if (isPdf) {
    mediaType = "application/pdf";
  } else {
    mediaType = fileType as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  }

  const base64 = Buffer.from(bytes).toString("base64");
  const extracted = await extractMenuFromImage(base64, mediaType);

  return NextResponse.json({ data: extracted });
}
