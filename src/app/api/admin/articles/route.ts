import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-server";
import { articleSchema } from "@/lib/validators/article";
import { createArticle } from "@/lib/repositories/articles";

export async function POST(request: NextRequest) {
  try {
    const { uid } = await requireRole(request, ["editor", "author", "super_admin"]);
    const body = await request.json().catch(() => null);
    const parsed = articleSchema.safeParse({ ...body, authorId: uid });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const id = await createArticle(parsed.data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
