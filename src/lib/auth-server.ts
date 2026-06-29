import { NextRequest } from "next/server";
import { adminAuth, type UserRole } from "@/lib/firebase/admin";

export async function requireRole(request: NextRequest, allowedRoles: UserRole[]) {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    throw new AuthError("Missing authorization token", 401);
  }
  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
  if (!decoded) {
    throw new AuthError("Invalid session", 401);
  }
  const role = (decoded.role as UserRole) ?? "reader";
  if (!allowedRoles.includes(role)) {
    throw new AuthError("Forbidden", 403);
  }
  return { uid: decoded.uid, role };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
