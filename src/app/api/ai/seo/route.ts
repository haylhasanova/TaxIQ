import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completeChat, AZ_GRAMMAR_INSTRUCTION } from "@/lib/groq";
import { requireRole, AuthError } from "@/lib/auth-server";

const requestSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(8000),
  locale: z.enum(["az", "en"]),
});

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

  const { title, content, locale } = parsed.data;
  const grammarNote = locale === "az" ? `\n\n${AZ_GRAMMAR_INSTRUCTION}` : "";
  const systemPrompt = `Generate SEO metadata as strict JSON: {"metaTitle": string (max 60 chars), "metaDescription": string (max 155 chars)}. Respond with JSON only, no markdown.${grammarNote}`;

  try {
    const raw = await completeChat({
      systemPrompt,
      userPrompt: `Title: ${title}\n\nContent:\n${content}`,
      temperature: 0.3,
      maxTokens: 300,
    });
    const cleaned = raw.trim().replace(/^```json\s*|```$/g, "");
    const parsedJson = JSON.parse(cleaned);
    return NextResponse.json(parsedJson);
  } catch {
    return NextResponse.json({ error: "SEO assist unavailable" }, { status: 503 });
  }
}
