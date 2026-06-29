import { adminDb } from "@/lib/firebase/admin";
import type { CategoryInput } from "@/lib/validators/category";

const COLLECTION = "categories";

export interface Category extends CategoryInput {
  id: string;
}

export async function listCategories(): Promise<Category[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("order", "asc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as CategoryInput) }));
}

export async function getCategoryBySlug(locale: "az" | "en", slug: string): Promise<Category | null> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where(`slug.${locale}`, "==", slug)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...(doc.data() as CategoryInput) };
}

export async function createCategory(data: CategoryInput): Promise<string> {
  const ref = await adminDb.collection(COLLECTION).add(data);
  return ref.id;
}

const SEED_CATEGORIES: CategoryInput[] = [
  {
    slug: { az: "maliyye", en: "finance" },
    name: { az: "Maliyyə", en: "Finance" },
    description: { az: "Bazarlar, bank işi, korporativ maliyyə", en: "Markets, banking, corporate finance" },
    accentColor: "#1e3a8a",
    order: 1,
  },
  {
    slug: { az: "vergi", en: "tax" },
    name: { az: "Vergi", en: "Tax" },
    description: { az: "Vergi qanunvericiliyi, son tarixlər, rəsmi qərarlar", en: "Tax law changes, deadlines, official rulings" },
    accentColor: "#15803d",
    order: 2,
  },
  {
    slug: { az: "muhasibatliq", en: "accounting" },
    name: { az: "Mühasibatlıq", en: "Accounting" },
    description: { az: "Standartlar (BMUS/yerli), hesabatlılıq", en: "Standards (IFRS/local GAAP), reporting" },
    accentColor: "#7c2d12",
    order: 3,
  },
  {
    slug: { az: "xeberler", en: "news" },
    name: { az: "Xəbərlər", en: "News" },
    description: { az: "Ümumi xəbərlər", en: "General news" },
    accentColor: "#475569",
    order: 4,
  },
];

export async function seedCategoriesIfEmpty(): Promise<void> {
  const existing = await adminDb.collection(COLLECTION).limit(1).get();
  if (!existing.empty) return;
  const batch = adminDb.batch();
  for (const category of SEED_CATEGORIES) {
    batch.set(adminDb.collection(COLLECTION).doc(), category);
  }
  await batch.commit();
}
