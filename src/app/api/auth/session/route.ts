import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/lib/firebase/admin";
import { ensureUserDoc } from "@/lib/repositories/users";

const requestSchema = z.object({ idToken: z.string().min(1) });
const SESSION_COOKIE = "taxiq_session";
const EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(parsed.data.idToken);
    await ensureUserDoc(decoded.uid, decoded.email ?? "", decoded.name ?? "", decoded.picture);

    const sessionCookie = await adminAuth.createSessionCookie(parsed.data.idToken, {
      expiresIn: EXPIRES_IN_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: EXPIRES_IN_MS / 1000,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
