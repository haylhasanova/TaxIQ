import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { AnnouncementInput } from "@/lib/validators/announcement";

const COLLECTION = "announcements";

export interface Announcement extends AnnouncementInput {
  id: string;
}

export async function listPublishedAnnouncements(limit = 50): Promise<Announcement[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("status", "==", "published")
    .orderBy("pinned", "desc")
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AnnouncementInput) }));
}

export async function listScheduledDue(now: Date): Promise<Announcement[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("status", "==", "scheduled")
    .where("publishAt", "<=", now)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AnnouncementInput) }));
}

export async function createAnnouncement(data: AnnouncementInput): Promise<string> {
  const ref = await adminDb.collection(COLLECTION).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as AnnouncementInput) };
}

export async function updateAnnouncement(id: string, data: Partial<AnnouncementInput>): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(id)
    .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function publishAnnouncement(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update({
    status: "published",
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
