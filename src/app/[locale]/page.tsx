import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { listFeaturedArticles, listPublishedArticles, listArticlesByCategory } from "@/lib/repositories/articles";
import { listPublishedAnnouncements } from "@/lib/repositories/announcements";
import { listCategories } from "@/lib/repositories/categories";
import { ChatWidget } from "@/components/public/chat-widget";
import type { Locale } from "@/i18n/config";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const isAz = locale === "az";

  const [featured, latest, announcements, categories] = await Promise.all([
    listFeaturedArticles(3).catch(() => []),
    listPublishedArticles(12).catch(() => []),
    listPublishedAnnouncements(5).catch(() => []),
    listCategories().catch(() => []),
  ]);

  const categoryCounts = await Promise.all(
    categories.map((category) =>
      listArticlesByCategory(category.id, 100)
        .then((articles) => articles.length)
        .catch(() => 0)
    )
  );

  const hero = featured[0];
  const heroSecondary = featured.slice(1, 3);
  const criticalAnnouncement = announcements.find((a) => a.severity === "critical");
  const totalPublished = latest.length;

  return (
    <div>
      {criticalAnnouncement && (
        <div className="bg-danger/10 px-4 py-2.5 text-center text-sm font-semibold text-danger">
          {criticalAnnouncement.title[locale]}
        </div>
      )}

      {/* HERO */}
      <section className="bg-ink pt-10 text-white">
        <div className="mx-auto grid max-w-6xl items-end gap-10 px-4 lg:grid-cols-[1fr_300px]">
          {hero ? (
            <div>
              <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
                <span className="h-px w-5 bg-gold" />
                {t("featured")}
              </span>
              <Link href={`/${locale}/article/${hero.slug[locale]}`} className="group block">
                <h1 className="max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                  {hero.title[locale] || hero.title.az}
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55">
                  {hero.excerpt[locale] || hero.excerpt.az}
                </p>
                <div className="mt-6 flex items-center gap-4 pb-10">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-bold text-ink transition-opacity group-hover:opacity-90">
                    {t("readMore")} <ArrowRight size={14} />
                  </span>
                  <span className="rounded-sm border border-gold/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                    {hero.tags[0] ?? ""}
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <div className="pb-10">
              <p className="text-white/50">
                {isAz ? "Hələ dərc olunmuş məqalə yoxdur." : "No published articles yet."}
              </p>
            </div>
          )}

          {heroSecondary.length > 0 && (
            <div className="hidden self-end rounded-t-md border border-b-0 border-white/10 bg-white/[0.04] lg:block">
              <p className="border-b border-white/10 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                {isAz ? "Həmçinin oxuyun" : "Also reading"}
              </p>
              <div className="divide-y divide-white/10">
                {heroSecondary.map((article) => (
                  <Link
                    key={article.id}
                    href={`/${locale}/article/${article.slug[locale]}`}
                    className="block px-5 py-3 text-sm font-semibold leading-snug text-white/75 transition-colors hover:text-gold"
                  >
                    {article.title[locale] || article.title.az}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* BODY */}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_300px]">
        <main>
          <div className="mb-5 flex items-center justify-between border-b border-border pb-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">{t("latest")}</span>
          </div>

          <div className="flex flex-col">
            {latest.map((article, index) => (
              <Link
                key={article.id}
                href={`/${locale}/article/${article.slug[locale]}`}
                className="group flex gap-4 border-b border-border py-4 last:border-none"
              >
                <span className="w-7 shrink-0 text-xl font-bold leading-none text-border">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {article.coverImage && (
                  <div className="relative h-[50px] w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                    <Image src={article.coverImage.url} alt={article.coverImage.alt[locale]} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gold">
                    {article.tags[0] ?? ""}
                  </span>
                  <h3 className="font-semibold leading-snug transition-colors group-hover:text-gold">
                    {article.title[locale] || article.title.az}
                  </h3>
                </div>
              </Link>
            ))}
            {totalPublished === 0 && (
              <p className="py-10 text-center text-muted">
                {isAz ? "Hələ dərc olunmuş məqalə yoxdur." : "No published articles yet."}
              </p>
            )}
          </div>
        </main>

        <aside className="flex flex-col gap-5">
          <div className="rounded-md border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Sparkles size={14} className="text-gold" />
              <span className="text-xs font-bold uppercase tracking-wide">
                {isAz ? "AI Köməkçi" : "AI Assistant"}
              </span>
            </div>
            <div className="p-4">
              <p className="mb-3 text-sm text-muted">
                {isAz
                  ? "Vergi, maliyyə və mühasibatlıqla bağlı sualınızı yazın — köməkçi dərc olunmuş məqalələrə əsaslanaraq cavab verəcək."
                  : "Ask about tax, finance, or accounting — the assistant answers based on published articles."}
              </p>
              <p className="text-xs font-semibold text-gold">
                {isAz ? "Sağ aşağıdaki düyməyə klikləyin →" : "Click the button in the corner →"}
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide">
                {isAz ? "Kateqoriyalar" : "Categories"}
              </span>
            </div>
            <div className="flex flex-col px-4 py-1">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/${locale}/category/${category.slug[locale]}`}
                  className="group flex items-center justify-between border-b border-border py-2.5 text-sm last:border-none"
                >
                  <span className="flex items-center gap-2 font-semibold text-foreground/80 transition-colors group-hover:text-gold">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.accentColor }} />
                    {category.name[locale]}
                  </span>
                  <span className="rounded-sm bg-background px-2 py-0.5 text-xs text-muted">
                    {categoryCounts[index] ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <ChatWidget locale={locale} />
    </div>
  );
}
