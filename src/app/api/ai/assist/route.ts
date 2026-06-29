import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completeChat, AZ_GRAMMAR_INSTRUCTION } from "@/lib/groq";
import { requireRole, AuthError } from "@/lib/auth-server";

const actionSchema = z.enum([
  "generate_draft",
  "improve",
  "continue",
  "shorten",
  "expand",
  "fix_grammar",
  "suggest_headlines",
  "generate_excerpt",
  "suggest_tags",
]);

const requestSchema = z.object({
  action: actionSchema,
  text: z.string().max(8000),
  locale: z.enum(["az", "en"]),
  brief: z.string().max(1000).optional(),
});

const ACTION_INSTRUCTIONS: Record<z.infer<typeof actionSchema>, { az: string; en: string }> = {
  generate_draft: {
    az: "Verilmiş başlıq/brief əsasında maliyyə/vergi/mühasibatlıq mövzusunda məqalə qaralaması yaz.",
    en: "Write an article draft on the given finance/tax/accounting headline or brief.",
  },
  improve: {
    az: "Seçilmiş mətni aydınlıq və ton baxımından təkmilləştir, mənasını dəyişmədən.",
    en: "Improve the selected text for clarity and tone without changing its meaning.",
  },
  continue: {
    az: "Verilmiş mətnin davamını yaz, üslubu qoru.",
    en: "Continue writing from the given text, preserving its style.",
  },
  shorten: {
    az: "Verilmiş mətni qısalt, əsas mənanı saxla.",
    en: "Shorten the given text while preserving its core meaning.",
  },
  expand: {
    az: "Verilmiş mətni daha çox təfərrüatla genişləndir.",
    en: "Expand the given text with more detail.",
  },
  fix_grammar: {
    az: "Mətndəki Azərbaycan dili qrammatik səhvlərini düzəlt və standart ədəbi dilə uyğunlaşdır.",
    en: "Fix grammar and style issues in the given text.",
  },
  suggest_headlines: {
    az: "Verilmiş mətn üçün 5 cəlbedici başlıq təklif et, hər birini yeni sətirdə yaz.",
    en: "Suggest 5 compelling headlines for the given text, one per line.",
  },
  generate_excerpt: {
    az: "Verilmiş mətn üçün 1-2 cümləlik qısa xülasə/meta təsvir yaz.",
    en: "Write a 1-2 sentence excerpt / meta description for the given text.",
  },
  suggest_tags: {
    az: "Verilmiş mətn üçün uyğun teqlər və kateqoriya (Maliyyə/Vergi/Mühasibatlıq) təklif et, vergüllə ayrılmış siyahı şəklində.",
    en: "Suggest relevant tags and a category (Finance/Tax/Accounting) for the given text, as a comma-separated list.",
  },
};

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["editor", "author", "super_admin"]);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { action, text, locale, brief } = parsed.data;
  const instruction = ACTION_INSTRUCTIONS[action][locale];
  const grammarNote = locale === "az" ? `\n\n${AZ_GRAMMAR_INSTRUCTION}` : "";
  const systemPrompt = `Sən TaxIQ redaksiya köməkçisisən. ${instruction}${grammarNote}`;
  const userPrompt = brief ? `Brief: ${brief}\n\nText:\n${text}` : text;

  try {
    const result = await completeChat({ systemPrompt, userPrompt, temperature: 0.5, maxTokens: 1200 });
    return NextResponse.json({ result, disclaimer: "AI-generated, review before publishing" });
  } catch {
    return NextResponse.json({ error: "AI assist unavailable" }, { status: 503 });
  }
}
