import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminAuth, type UserRole } from "@/lib/firebase/admin";

const COLLECTION = "users";

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
}

export async function ensureUserDoc(uid: string, email: string, displayName: string, photoURL?: string) {
  const ref = adminDb.collection(COLLECTION).doc(uid);
  const doc = await ref.get();
  if (doc.exists) return;
  await ref.set({
    uid,
    email,
    displayName,
    photoURL: photoURL ?? null,
    role: "reader" satisfies UserRole,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, { role });
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .update({ role, updatedAt: FieldValue.serverTimestamp() });
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  const doc = await adminDb.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as UserDoc;
}
