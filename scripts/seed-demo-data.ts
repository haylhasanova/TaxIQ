import "dotenv/config";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { seedCategoriesIfEmpty, listCategories } from "@/lib/repositories/categories";
import { createArticle } from "@/lib/repositories/articles";
import { createAnnouncement } from "@/lib/repositories/announcements";
import type { ArticleInput } from "@/lib/validators/article";
import type { AnnouncementInput } from "@/lib/validators/announcement";

const DEMO_AUTHOR_UID = "demo-author";

function tiptapDoc(paragraphs: string[]) {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

function html(paragraphs: string[]) {
  return paragraphs.map((p) => `<p>${p}</p>`).join("\n");
}

async function ensureDemoAuthor() {
  await adminDb.collection("users").doc(DEMO_AUTHOR_UID).set(
    {
      uid: DEMO_AUTHOR_UID,
      email: "demo.author@taxiq.az",
      displayName: "TaxIQ Redaksiyası",
      role: "editor",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

const DEMO_ARTICLES: Array<Omit<ArticleInput, "categoryId"> & { categorySlug: string }> = [
  {
    categorySlug: "vergi",
    title: { az: "2026-cı il üçün gəlir vergisi dərəcələri açıqlandı", en: "Income tax rates for 2026 announced" },
    slug: { az: "2026-geliz-vergisi-dereceleri", en: "2026-income-tax-rates" },
    excerpt: {
      az: "Vergilər Nazirliyi 2026-cı il üçün yeni gəlir vergisi cədvəlini elan etdi.",
      en: "The Ministry of Taxes announced the new income tax schedule for 2026.",
    },
    content: {
      az: tiptapDoc([
        "Vergilər Nazirliyi 2026-cı il üçün gəlir vergisi dərəcələrini açıqlayıb.",
        "Yeni cədvəl fiziki şəxslərin əmək haqqından tutulan vergi həddlərini tənzimləyir.",
      ]),
      en: tiptapDoc([
        "The Ministry of Taxes has published the income tax rates for 2026.",
        "The new schedule regulates withholding thresholds on individual wages.",
      ]),
    },
    contentHtml: {
      az: html([
        "Vergilər Nazirliyi 2026-cı il üçün gəlir vergisi dərəcələrini açıqlayıb.",
        "Yeni cədvəl fiziki şəxslərin əmək haqqından tutulan vergi həddlərini tənzimləyir.",
      ]),
      en: html([
        "The Ministry of Taxes has published the income tax rates for 2026.",
        "The new schedule regulates withholding thresholds on individual wages.",
      ]),
    },
    coverImage: null,
    tags: ["vergi", "2026", "qanunvericilik"],
    authorId: DEMO_AUTHOR_UID,
    status: "published",
    featured: true,
    readingMinutes: 3,
    views: 124,
  },
  {
    categorySlug: "maliyye",
    title: { az: "Mərkəzi Bank uçot dərəcəsini sabit saxladı", en: "Central Bank holds the refinancing rate steady" },
    slug: { az: "merkezi-bank-uçot-derecesi", en: "central-bank-rate-steady" },
    excerpt: {
      az: "Azərbaycan Mərkəzi Bankı uçot dərəcəsini dəyişməz saxlamaq qərarına gəlib.",
      en: "The Central Bank of Azerbaijan decided to keep the refinancing rate unchanged.",
    },
    content: {
      az: tiptapDoc([
        "Mərkəzi Bankın İdarə Heyəti uçot dərəcəsini 7,25% səviyyəsində saxlamağı qərara alıb.",
        "Qərar inflyasiya gözləntiləri və maliyyə bazarlarının sabitliyi nəzərə alınaraq verilib.",
      ]),
      en: tiptapDoc([
        "The Central Bank's Management Board decided to keep the refinancing rate at 7.25%.",
        "The decision was made considering inflation expectations and financial market stability.",
      ]),
    },
    contentHtml: {
      az: html([
        "Mərkəzi Bankın İdarə Heyəti uçot dərəcəsini 7,25% səviyyəsində saxlamağı qərara alıb.",
        "Qərar inflyasiya gözləntiləri və maliyyə bazarlarının sabitliyi nəzərə alınaraq verilib.",
      ]),
      en: html([
        "The Central Bank's Management Board decided to keep the refinancing rate at 7.25%.",
        "The decision was made considering inflation expectations and financial market stability.",
      ]),
    },
    coverImage: null,
    tags: ["mərkəzi-bank", "uçot-dərəcəsi"],
    authorId: DEMO_AUTHOR_UID,
    status: "published",
    featured: false,
    readingMinutes: 2,
    views: 87,
  },
  {
    categorySlug: "muhasibatliq",
    title: { az: "BMUHS 16 standartına dəyişikliklər qüvvəyə minir", en: "Amendments to IFRS 16 take effect" },
    slug: { az: "bmuhs-16-deyisiklikler", en: "ifrs-16-amendments" },
    excerpt: {
      az: "İcarə uçotuna dair BMUHS 16 standartında edilən dəyişikliklər mühasiblər üçün yeni tələblər müəyyən edir.",
      en: "Amendments to lease-accounting standard IFRS 16 introduce new requirements for accountants.",
    },
    content: {
      az: tiptapDoc([
        "BMUHS 16 standartına edilən son dəyişikliklər icarə müqavilələrinin uçotunda aydınlıq gətirir.",
        "Şirkətlər yeni tələblərə uyğunlaşmaq üçün hesabat siyasətlərini yenidən nəzərdən keçirməlidir.",
      ]),
      en: tiptapDoc([
        "Recent amendments to IFRS 16 bring clarity to lease accounting treatment.",
        "Companies should review their reporting policies to align with the new requirements.",
      ]),
    },
    contentHtml: {
      az: html([
        "BMUHS 16 standartına edilən son dəyişikliklər icarə müqavilələrinin uçotunda aydınlıq gətirir.",
        "Şirkətlər yeni tələblərə uyğunlaşmaq üçün hesabat siyasətlərini yenidən nəzərdən keçirməlidir.",
      ]),
      en: html([
        "Recent amendments to IFRS 16 bring clarity to lease accounting treatment.",
        "Companies should review their reporting policies to align with the new requirements.",
      ]),
    },
    coverImage: null,
    tags: ["bmuhs", "standartlar"],
    authorId: DEMO_AUTHOR_UID,
    status: "published",
    featured: false,
    readingMinutes: 4,
    views: 45,
  },
  {
    categorySlug: "xeberler",
    title: { az: "TaxIQ platforması istifadəyə verildi", en: "TaxIQ platform launches" },
    slug: { az: "taxiq-platformasi-istifadeye-verildi", en: "taxiq-platform-launches" },
    excerpt: {
      az: "Maliyyə, vergi və mühasibatlıq sahəsində yeni media platforması — TaxIQ — fəaliyyətə başladı.",
      en: "A new media platform for finance, tax and accounting news — TaxIQ — has launched.",
    },
    content: {
      az: tiptapDoc(["TaxIQ ikidilli (Azərbaycan/İngilis) xəbər və elan platforması olaraq oxuculara təqdim olunur."]),
      en: tiptapDoc(["TaxIQ is introduced to readers as a bilingual (Azerbaijani/English) news and announcements platform."]),
    },
    contentHtml: {
      az: html(["TaxIQ ikidilli (Azərbaycan/İngilis) xəbər və elan platforması olaraq oxuculara təqdim olunur."]),
      en: html(["TaxIQ is introduced to readers as a bilingual (Azerbaijani/English) news and announcements platform."]),
    },
    coverImage: null,
    tags: ["taxiq", "elan"],
    authorId: DEMO_AUTHOR_UID,
    status: "published",
    featured: false,
    readingMinutes: 1,
    views: 12,
  },
];

const DEMO_ANNOUNCEMENTS: AnnouncementInput[] = [
  {
    title: { az: "Mənfəət vergisi bəyannaməsinin son tarixi", en: "Profit tax return deadline" },
    body: {
      az: tiptapDoc(["Hüquqi şəxslər üçün illik mənfəət vergisi bəyannaməsinin təqdim edilməsinin son tarixi yaxınlaşır."]),
      en: tiptapDoc(["The deadline for legal entities to submit the annual profit tax return is approaching."]),
    },
    type: "deadline",
    severity: "warning",
    effectiveDate: new Date("2026-07-31"),
    status: "published",
    pinned: true,
  },
  {
    title: { az: "Yeni elektron qaimə-faktura qaydaları", en: "New e-invoice regulations" },
    body: {
      az: tiptapDoc(["Vergi ödəyiciləri üçün elektron qaimə-faktura sistemində yeni qaydalar qüvvəyə minib."]),
      en: tiptapDoc(["New rules for the electronic invoicing system have taken effect for taxpayers."]),
    },
    type: "regulation",
    severity: "info",
    effectiveDate: new Date("2026-07-01"),
    status: "published",
    pinned: false,
  },
  {
    title: { az: "Mühasiblər üçün pulsuz vebinar", en: "Free webinar for accountants" },
    body: {
      az: tiptapDoc(["BMUHS standartlarına dair pulsuz onlayn seminar keçiriləcək."]),
      en: tiptapDoc(["A free online seminar on IFRS standards will be held."]),
    },
    type: "event",
    severity: "info",
    effectiveDate: new Date("2026-07-15"),
    status: "published",
    pinned: false,
  },
];

async function main() {
  await seedCategoriesIfEmpty();
  const categories = await listCategories();
  const categoryBySlug = new Map(categories.map((c) => [c.slug.az, c.id]));

  await ensureDemoAuthor();

  const existingArticles = await adminDb.collection("articles").limit(1).get();
  if (existingArticles.empty) {
    for (const { categorySlug, ...article } of DEMO_ARTICLES) {
      const categoryId = categoryBySlug.get(categorySlug);
      if (!categoryId) continue;
      const id = await createArticle({ ...article, categoryId, publishedAt: new Date() });
      console.log(`Created article: ${article.title.az} (${id})`);
    }
  } else {
    console.log("Articles already exist, skipping.");
  }

  const existingAnnouncements = await adminDb.collection("announcements").limit(1).get();
  if (existingAnnouncements.empty) {
    for (const announcement of DEMO_ANNOUNCEMENTS) {
      const id = await createAnnouncement({ ...announcement, publishedAt: new Date() });
      console.log(`Created announcement: ${announcement.title.az} (${id})`);
    }
  } else {
    console.log("Announcements already exist, skipping.");
  }
}

main()
  .then(() => {
    console.log("Demo data seeded.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
