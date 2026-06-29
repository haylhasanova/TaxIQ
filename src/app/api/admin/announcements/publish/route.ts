import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole, AuthError } from "@/lib/auth-server";
import { publishAnnouncement } from "@/lib/repositories/announcements";

const requestSchema = z.object({ announcementId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["editor", "super_admin"]);
    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    await publishAnnouncement(parsed.data.announcementId);
    for (const locale of ["az", "en"] as const) {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/announcements`);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
