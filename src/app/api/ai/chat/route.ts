import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completeChat, AZ_GRAMMAR_INSTRUCTION } from "@/lib/groq";
import { listPublishedArticles } from "@/lib/repositories/articles";
import { isRateLimited, getClientKey } from "@/lib/rate-limit";
import type { Locale } from "@/i18n/config";

const requestSchema = z.object({
  locale: z.enum(["az", "en"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
});

function buildSystemPrompt(locale: Locale, context: string) {
  const base =
    locale === "az"
      ? `Sən TaxIQ saytının maliyyə, vergi və mühasibatlıq köməkçisisən. Yalnız bu mövzularda cavab ver. Cavablarını aşağıdakı dərc olunmuş məqalə parçalarına əsaslandır və mümkün olduqda mənbəyə istinad et. Əgər bilmirsənsə, bunu açıq de və uyğun kateqoriyaları təklif et. Heç vaxt vergi rəqəmləri və ya hüquqi iddialar uydurma.\n\n${AZ_GRAMMAR_INSTRUCTION}`
      : `You are TaxIQ's finance, tax, and accounting assistant. Only answer within this domain. Ground your answers in the published article excerpts below and reference them where possible. If you don't know, say so plainly and suggest relevant categories. Never invent tax figures or legal claims.`;

  return `${base}\n\nContext:\n${context}`;
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  if (isRateLimited(`chat:${clientKey}`, 15, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { locale, messages } = parsed.data;
  const lastUserMessage = messages[messages.length - 1]?.content ?? "";

  let context = "(no published articles yet)";
  try {
    const articles = await listPublishedArticles(30);
    const keywords = lastUserMessage.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const relevant = articles
      .filter((article) => {
        const haystack = `${article.title[locale]} ${article.excerpt[locale]} ${article.tags.join(" ")}`.toLowerCase();
        return keywords.some((kw) => haystack.includes(kw));
      })
      .slice(0, 5);
    const pool = relevant.length > 0 ? relevant : articles.slice(0, 5);
    context = pool
      .map((a) => `- ${a.title[locale]}: ${a.excerpt[locale]} (/${locale}/article/${a.slug[locale]})`)
      .join("\n");
  } catch {
    // Firestore unavailable — fall back to ungrounded but constrained answer.
  }

  try {
    const reply = await completeChat({
      systemPrompt: buildSystemPrompt(locale, context),
      userPrompt: lastUserMessage,
      temperature: 0.3,
      maxTokens: 600,
    });
    return NextResponse.json({ reply });
  } catch {
    const fallback =
      locale === "az"
        ? "Hazırda cavab verə bilmirəm. Zəhmət olmasa bir az sonra yenidən cəhd edin."
        : "I can't answer right now. Please try again shortly.";
    return NextResponse.json({ reply: fallback }, { status: 200 });
  }
}
