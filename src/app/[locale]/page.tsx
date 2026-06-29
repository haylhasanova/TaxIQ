import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { listFeaturedArticles, listPublishedArticles } from "@/lib/repositories/articles";
import { listPublishedAnnouncements } from "@/lib/repositories/announcements";
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

  const [featured, latest, announcements] = await Promise.all([
    listFeaturedArticles(1).catch(() => []),
    listPublishedArticles(9).catch(() => []),
    listPublishedAnnouncements(5).catch(() => []),
  ]);

  const hero = featured[0];
  const criticalAnnouncement = announcements.find((a) => a.severity === "critical");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {criticalAnnouncement && (
        <div className="mb-6 rounded-lg border border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          {criticalAnnouncement.title[locale]}
        </div>
      )}

      {hero ? (
        <Link href={`/${locale}/article/${hero.slug[locale]}`} className="group mb-12 block">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
            {t("featured")}
          </span>
          {hero.coverImage && (
            <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface">
              <Image
                src={hero.coverImage.url}
                alt={hero.coverImage.alt[locale]}
                fill
                priority
                className="object-cover transition-transform group-hover:scale-[1.02]"
              />
            </div>
          )}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {hero.title[locale]}
          </h1>
          <p className="mt-2 max-w-2xl text-muted">{hero.excerpt[locale]}</p>
        </Link>
      ) : (
        <div className="mb-12 rounded-2xl border border-border bg-surface p-10 text-center text-muted">
          Hələ dərc olunmuş məqalə yoxdur.
        </div>
      )}

      <h2 className="mb-4 text-xl font-bold">{t("latest")}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map((article) => (
          <Link
            key={article.id}
            href={`/${locale}/article/${article.slug[locale]}`}
            className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
          >
            {article.coverImage && (
              <div className="relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-lg bg-background">
                <Image
                  src={article.coverImage.url}
                  alt={article.coverImage.alt[locale]}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h3 className="font-bold leading-snug group-hover:text-accent">{article.title[locale]}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{article.excerpt[locale]}</p>
          </Link>
        ))}
      </div>

      <ChatWidget locale={locale} />
    </div>
  );
}
