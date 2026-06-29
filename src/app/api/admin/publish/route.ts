import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole, AuthError } from "@/lib/auth-server";
import { publishArticle, getArticleById } from "@/lib/repositories/articles";

const requestSchema = z.object({ articleId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["editor", "super_admin"]);
    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await publishArticle(parsed.data.articleId);
    const article = await getArticleById(parsed.data.articleId);
    if (article) {
      for (const locale of ["az", "en"] as const) {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/article/${article.slug[locale]}`);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
