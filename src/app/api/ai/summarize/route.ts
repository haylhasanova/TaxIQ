import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completeChat, AZ_GRAMMAR_INSTRUCTION } from "@/lib/groq";
import { getArticleById, setAiSummary } from "@/lib/repositories/articles";
import { isRateLimited, getClientKey } from "@/lib/rate-limit";

const requestSchema = z.object({
  articleId: z.string().min(1),
  locale: z.enum(["az", "en"]),
});

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  if (isRateLimited(`summarize:${clientKey}`, 20, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { articleId, locale } = parsed.data;
  const article = await getArticleById(articleId);
  if (!article || article.status !== "published") {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const cached = article.aiSummary?.[locale];
  if (cached) {
    return NextResponse.json({ summary: cached, cached: true });
  }

  const plainText = article.excerpt[locale] ?? article.excerpt.az ?? "";
  const systemPrompt =
    locale === "az"
      ? `Verilmiş maliyyə/vergi/mühasibatlıq məqaləsini 3-5 bənddən ibarət qısa xülasə şəklində ümumiləşdir. ${AZ_GRAMMAR_INSTRUCTION}`
      : "Summarize the given finance/tax/accounting article into a concise 3-5 bullet summary.";

  try {
    const summary = await completeChat({
      systemPrompt,
      userPrompt: `${article.title[locale]}\n\n${plainText}`,
      temperature: 0.3,
      maxTokens: 400,
    });
    await setAiSummary(articleId, locale, summary).catch(() => null);
    return NextResponse.json({ summary, cached: false });
  } catch {
    return NextResponse.json({ error: "AI summary unavailable" }, { status: 503 });
  }
}
