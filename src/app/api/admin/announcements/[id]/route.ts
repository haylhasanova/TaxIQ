import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-server";
import { announcementSchema } from "@/lib/validators/announcement";
import { getAnnouncementById, updateAnnouncement } from "@/lib/repositories/announcements";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(request, ["author", "editor", "super_admin"]);
    const { id } = await params;
    const announcement = await getAnnouncementById(id);
    if (!announcement) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(announcement);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(request, ["author", "editor", "super_admin"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = announcementSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    await updateAnnouncement(id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
