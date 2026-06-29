import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completeChat, AZ_GRAMMAR_INSTRUCTION } from "@/lib/groq";
import { requireRole, AuthError } from "@/lib/auth-server";

const requestSchema = z.object({
  text: z.string().min(1).max(8000),
  direction: z.enum(["az_to_en", "en_to_az"]),
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

  const { text, direction } = parsed.data;
  const targetIsAz = direction === "en_to_az";
  const systemPrompt = targetIsAz
    ? `İngilis dilindən Azərbaycan dilinə tərcümə et. ${AZ_GRAMMAR_INSTRUCTION}`
    : "Translate from Azerbaijani to English. Keep finance/tax/accounting terminology precise and natural.";

  try {
    const translation = await completeChat({
      systemPrompt,
      userPrompt: text,
      temperature: 0.2,
      maxTokens: 1500,
    });
    return NextResponse.json({
      translation,
      disclaimer: "Machine translation draft — review required before publishing.",
    });
  } catch {
    return NextResponse.json({ error: "Translation unavailable" }, { status: 503 });
  }
}
