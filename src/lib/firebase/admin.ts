import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin credentials in environment variables.");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

function lazy<T extends object>(factory: () => T): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      if (!instance) instance = factory();
      return Reflect.get(instance, prop, receiver);
    },
  });
}

export const adminAuth = lazy(() => getAuth(getAdminApp()));
export const adminDb = lazy(() => getFirestore(getAdminApp()));
export const adminStorage = lazy(() => getStorage(getAdminApp()));

export type UserRole = "super_admin" | "editor" | "author" | "reader";

export async function verifySessionAndRole(
  idToken: string,
  allowedRoles: UserRole[]
) {
  const decoded = await adminAuth.verifyIdToken(idToken);
  const role = (decoded.role as UserRole) ?? "reader";
  if (!allowedRoles.includes(role)) {
    throw new Error("Forbidden: insufficient role");
  }
  return { uid: decoded.uid, role };
}
