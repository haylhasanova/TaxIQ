import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-server";
import { articleSchema } from "@/lib/validators/article";
import { getArticleById, updateArticle } from "@/lib/repositories/articles";
import { tiptapToHtml } from "@/lib/tiptap-server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(request, ["author", "editor", "super_admin"]);
    const { id } = await params;
    const article = await getArticleById(id);
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { uid } = await requireRole(request, ["author", "editor", "super_admin"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = articleSchema.partial().safeParse({ ...body, authorId: body?.authorId ?? uid });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    if (data.content) {
      data.contentHtml = {
        az: tiptapToHtml(data.content.az),
        en: tiptapToHtml(data.content.en),
      };
    }

    await updateArticle(id, data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
