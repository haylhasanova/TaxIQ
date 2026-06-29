import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { ArticleInput } from "@/lib/validators/article";

const COLLECTION = "articles";

export interface Article extends ArticleInput {
  id: string;
}

export async function listPublishedArticles(limit = 20): Promise<Article[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ArticleInput) }));
}

export async function listFeaturedArticles(limit = 1): Promise<Article[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("featured", "==", true)
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ArticleInput) }));
}

export async function listArticlesByCategory(categoryId: string, limit = 20): Promise<Article[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("categoryId", "==", categoryId)
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ArticleInput) }));
}

export async function getArticleBySlug(locale: "az" | "en", slug: string): Promise<Article | null> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where(`slug.${locale}`, "==", slug)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...(doc.data() as ArticleInput) };
}

export async function getArticleById(id: string): Promise<Article | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as ArticleInput) };
}

export async function listScheduledDue(now: Date): Promise<Article[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("status", "==", "scheduled")
    .where("publishAt", "<=", now)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ArticleInput) }));
}

export async function createArticle(data: ArticleInput): Promise<string> {
  const ref = await adminDb.collection(COLLECTION).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateArticle(id: string, data: Partial<ArticleInput>): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(id)
    .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function publishArticle(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update({
    status: "published",
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function incrementViews(id: string): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(id)
    .update({ views: FieldValue.increment(1) });
}

export async function setAiSummary(id: string, locale: "az" | "en", summary: string): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(id)
    .update({ [`aiSummary.${locale}`]: summary });
}
