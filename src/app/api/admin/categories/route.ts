import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-server";
import { categorySchema } from "@/lib/validators/category";
import { createCategory } from "@/lib/repositories/categories";

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["super_admin"]);
    const body = await request.json().catch(() => null);
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const id = await createCategory(parsed.data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
