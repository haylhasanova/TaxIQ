import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, type UserRole } from "@/lib/firebase/admin";

const SESSION_COOKIE = "taxiq_session";

export async function requireAdminSession(allowedRoles: UserRole[]) {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) {
    redirect("/az/sign-in");
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const role = (decoded.role as UserRole) ?? "reader";
    if (!allowedRoles.includes(role)) {
      redirect("/az");
    }
    return { uid: decoded.uid, role, email: decoded.email ?? "" };
  } catch {
    redirect("/az/sign-in");
  }
}
