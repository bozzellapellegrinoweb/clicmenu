import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedMenu } from "@/types";
import { VALID_TAG_KEYS } from "@/lib/tags";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

const EXTRACTION_PROMPT = `Analizza questa immagine/documento di un menu (ristorante, bar, spa, o simile) ed estrai tutte le informazioni in formato JSON strutturato.

REGOLE GENERALI:
- Mantieni la lingua originale del menu
- Se il prezzo non è leggibile o non presente, usa null
- Raggruppa i piatti/trattamenti nelle loro categorie originali
- Includi le descrizione se presenti
- Estrai TUTTI i piatti, anche se sono molti

RICONOSCIMENTO TAG — analizza il testo di ogni piatto e assegna i tag pertinenti scegliendo SOLO dai valori seguenti:
${VALID_TAG_KEYS.map((k) => `"${k}"`).join(", ")}

Regole per i tag:
- ALLERGENI (obbligatori per legge EU 1169/2011): rileva glutine, crostacei, uova, pesce, arachidi, soia, latte, frutta a guscio, sedano, senape, sesamo, solfiti, lupini, molluschi — anche quando sono ingredienti impliciti (es. "mozzarella" → "latte", "pasta" → "glutine", "gamberetti" → "crostacei")
- SURGELATO: aggiungi "surgelato" se vedi simboli ❄️, asterischi (*) vicino al nome, o parole come "surgelato", "decongelato", "congelato", "abbattuto"
- DIETA: rileva "vegano", "vegetariano", "senza glutine", "senza lattosio", "piccante" dal testo o dai simboli
- QUALITÀ: rileva "biologico", "dop", "igp", "km0", "consigliato", "novità" se esplicitamente indicati
- Non inventare tag non supportati dal testo — solo quelli evidenti

Rispondi SOLO con JSON valido, senza testo aggiuntivo:
{
  "categories": [
    {
      "name": "Nome categoria",
      "items": [
        {
          "name": "Nome piatto",
          "description": "Descrizione o null",
          "price": 12.50,
          "tags": ["glutine", "latte", "vegetariano"]
        }
      ]
    }
  ]
}`;

export async function translateMenu(
  content: { categories: { name: string; items: { name: string; description: string | null }[] }[] },
  targetLang: string
): Promise<typeof content> {
  const langNames: Record<string, string> = { en: "English", de: "German", fr: "French", es: "Spanish", it: "Italian" };
  const message = await getClient().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: `Translate this menu JSON to ${langNames[targetLang] ?? targetLang}. Keep the exact same JSON structure. Translate only "name" and "description" text fields. Do NOT translate "tags" arrays — keep tag values exactly as-is. Keep prices and null values unchanged. Reply ONLY with valid JSON, no extra text.\n\n${JSON.stringify(content)}`,
    }],
  });
  const text = (message.content[0] as { type: string; text: string }).text
    .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(text);
}

export async function extractMenuFromImage(
  fileBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "application/pdf"
): Promise<ExtractedMenu> {
  const contentBlock = mediaType === "application/pdf"
    ? {
        type: "document" as const,
        source: {
          type: "base64" as const,
          media_type: "application/pdf" as const,
          data: fileBase64,
        },
      }
    : {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType,
          data: fileBase64,
        },
      };

  const message = await getClient().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contentBlock as any,
          {
            type: "text",
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Risposta AI non valida");
  }

  // Pulisci il JSON da eventuali markdown code blocks
  const jsonText = content.text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(jsonText) as ExtractedMenu;
  return parsed;
}
