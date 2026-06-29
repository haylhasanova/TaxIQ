import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth-server";
import { setUserRole } from "@/lib/repositories/users";

const requestSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(["super_admin", "editor", "author", "reader"]),
});

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["super_admin"]);
    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    await setUserRole(parsed.data.uid, parsed.data.role);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
