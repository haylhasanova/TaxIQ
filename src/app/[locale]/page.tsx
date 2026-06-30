import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { listFeaturedArticles, listPublishedArticles } from "@/lib/repositories/articles";
import { listPublishedAnnouncements } from "@/lib/repositories/announcements";
import { listCategories } from "@/lib/repositories/categories";
import { ChatWidget } from "@/components/public/chat-widget";
import type { Locale } from "@/i18n/config";

export const revalidate = 60;

function ArticleImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`bg-gradient-to-br from-ink/80 to-primary/60 ${className ?? ""}`}
        aria-hidden
      />
    );
  }
  return (
    <Image src={src} alt={alt} fill className={`object-cover ${className ?? ""}`} sizes="(max-width: 768px) 100vw, 50vw" />
  );
}

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
    listPublishedArticles(20).catch(() => []),
    listPublishedAnnouncements(3).catch(() => []),
    listCategories().catch(() => []),
  ]);

  const hero = featured[0] ?? latest[0];
  const recommended = latest.slice(0, 5);
  const trending = latest.slice(0, 6);
  const latestList = latest.slice(0, 4);
  const latestFeatured = latest[4] ?? latest[0];
  const popular = latest.slice(5, 14);

  const criticalAnnouncement = announcements.find((a) => a.severity === "critical");

  const href = (article: (typeof latest)[0]) =>
    `/${locale}/article/${article.slug[locale] || article.slug.az}`;
  const title = (article: (typeof latest)[0]) =>
    article.title[locale] || article.title.az;
  const tag = (article: (typeof latest)[0]) => article.tags[0] ?? "";

  if (!hero && latest.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-muted">
        <p className="text-lg font-semibold">
          {isAz ? "Hələ dərc olunmuş məqalə yoxdur." : "No published articles yet."}
        </p>
        <Link href={`/${locale}/sign-in`} className="rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white">
          {isAz ? "Admin girişi" : "Admin login"}
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {criticalAnnouncement && (
        <div className="bg-danger/10 px-4 py-2 text-center text-sm font-semibold text-danger">
          {criticalAnnouncement.title[locale]}
        </div>
      )}

      {/* ── HERO ── */}
      {hero && (
        <section className="mx-auto max-w-7xl px-5 py-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            {/* Hero card */}
            <Link
              href={href(hero)}
              className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-2xl bg-ink"
            >
              <div className="absolute inset-0">
                <ArticleImage
                  src={hero.coverImage?.url}
                  alt={hero.coverImage?.alt[locale] ?? title(hero)}
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
              </div>
              <div className="relative p-6 lg:p-8">
                <span className="mb-3 inline-block rounded border border-gold/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold">
                  {isAz ? "Həftənin seçimi" : "Best of the week"}
                </span>
                <p className="mb-1 text-xs text-white/50">
                  {tag(hero)} · {locale === "az" ? "TaxIQ Redaksiyası" : "TaxIQ Editorial"}
                </p>
                <h1 className="max-w-lg text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-3xl">
                  {title(hero)}
                </h1>
                <div className="mt-4 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-ink">
                    {isAz ? "Məqaləni oxu" : "Read article"} <ArrowRight size={14} />
                  </span>
                  {hero.tags.slice(1, 3).map((tg) => (
                    <span key={tg} className="text-xs text-white/40">
                      #{tg}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            {/* Recommended sidebar */}
            <div className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-muted">
                  {isAz ? "Tövsiyə edilir" : "Recommended"}
                </span>
                <Link href={`/${locale}`} className="flex items-center gap-1 text-xs font-semibold text-foreground/60 hover:text-ink">
                  {isAz ? "Hamısı" : "View all"} <ChevronRight size={13} />
                </Link>
              </div>

              {/* Top recommended card */}
              {recommended[0] && (
                <Link
                  href={href(recommended[0])}
                  className="group relative mb-3 block h-36 overflow-hidden rounded-xl bg-ink"
                >
                  <div className="absolute inset-0">
                    <ArticleImage
                      src={recommended[0].coverImage?.url}
                      alt={recommended[0].coverImage?.alt[locale] ?? title(recommended[0])}
                      className="transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                  </div>
                  <div className="absolute bottom-0 p-3">
                    <p className="text-[10px] text-white/50">{tag(recommended[0])}</p>
                    <p className="text-sm font-bold leading-snug text-white line-clamp-2">
                      {title(recommended[0])}
                    </p>
                  </div>
                </Link>
              )}

              {/* List */}
              <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
                {recommended.slice(1).map((a) => (
                  <Link
                    key={a.id}
                    href={href(a)}
                    className="group flex items-center gap-3 p-3 hover:bg-background"
                  >
                    <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-background">
                      {a.coverImage ? (
                        <Image src={a.coverImage.url} alt={a.coverImage.alt[locale]} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-ink/70 to-primary/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{tag(a)}</p>
                      <p className="text-xs font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-gold">
                        {title(a)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TRENDING NOW ── */}
      {trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-4">
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            {/* Left: numbered list */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-block rounded border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
                  {isAz ? "Trend xəbərlər" : "Trending now"}
                </span>
                <Link href={`/${locale}`} className="flex items-center gap-1 text-xs font-semibold text-foreground/60 hover:text-ink">
                  {isAz ? "Daha çox" : "View more"} <ArrowRight size={13} />
                </Link>
              </div>
              <div className="flex flex-col">
                {trending.slice(0, 5).map((a, i) => (
                  <Link
                    key={a.id}
                    href={href(a)}
                    className="group flex items-start gap-3 border-b border-border py-3 last:border-none"
                  >
                    <span className="mt-0.5 w-5 shrink-0 text-sm font-bold text-muted/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-1 items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gold">{tag(a)}</p>
                        <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-gold line-clamp-2">
                          {title(a)}
                        </p>
                      </div>
                      {a.coverImage && (
                        <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg">
                          <Image src={a.coverImage.url} alt={a.coverImage.alt[locale]} fill className="object-cover" sizes="56px" />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: 3x2 image grid */}
            <div className="grid grid-cols-3 gap-3">
              {trending.slice(0, 6).map((a) => (
                <Link
                  key={a.id}
                  href={href(a)}
                  className="group relative block overflow-hidden rounded-xl bg-ink"
                  style={{ aspectRatio: "4/3" }}
                >
                  <div className="absolute inset-0">
                    <ArticleImage
                      src={a.coverImage?.url}
                      alt={a.coverImage?.alt[locale] ?? title(a)}
                      className="transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 p-2.5">
                    <p className="text-[10px] font-semibold text-white/50">{tag(a)}</p>
                    <p className="text-[11px] font-bold leading-snug text-white line-clamp-2">{title(a)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LATEST NEWS ── */}
      {latest.length > 4 && (
        <section className="mx-auto max-w-7xl px-5 py-4">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr_260px]">
            {/* Left: article list with thumbnails */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-block rounded border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
                  {isAz ? "Son xəbərlər" : "Latest news"}
                </span>
                <Link href={`/${locale}`} className="flex items-center gap-1 text-xs text-foreground/60 hover:text-ink">
                  {isAz ? "Daha çox" : "More"} <ArrowRight size={13} />
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {latestList.map((a) => (
                  <Link key={a.id} href={href(a)} className="group flex gap-3">
                    <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-background">
                      {a.coverImage ? (
                        <Image src={a.coverImage.url} alt={a.coverImage.alt[locale]} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-ink/60 to-primary/30" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{tag(a)}</p>
                      <p className="text-[13px] font-semibold leading-snug text-foreground group-hover:text-gold line-clamp-2">
                        {title(a)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Center: big featured article */}
            {latestFeatured && (
              <Link
                href={href(latestFeatured)}
                className="group relative block overflow-hidden rounded-2xl bg-ink min-h-[280px]"
              >
                <div className="absolute inset-0">
                  <ArticleImage
                    src={latestFeatured.coverImage?.url}
                    alt={latestFeatured.coverImage?.alt[locale] ?? title(latestFeatured)}
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 p-5">
                  <p className="text-[10px] font-semibold text-white/50">{tag(latestFeatured)}</p>
                  <h3 className="mt-1 text-lg font-extrabold leading-snug text-white">{title(latestFeatured)}</h3>
                </div>
              </Link>
            )}

            {/* Right: text excerpt */}
            {latestFeatured && (
              <div className="flex flex-col justify-center gap-4">
                <p className="text-sm leading-relaxed text-muted line-clamp-6">
                  {latestFeatured.excerpt[locale] || latestFeatured.excerpt.az}
                </p>
                <Link
                  href={href(latestFeatured)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-ink hover:text-ink"
                >
                  {isAz ? "Məqaləni oxu" : "Read article"} <ArrowRight size={13} />
                </Link>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {categories.slice(0, 4).map((c) => (
                    <Link
                      key={c.id}
                      href={`/${locale}/category/${c.slug[locale]}`}
                      className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted hover:text-ink transition-colors border border-border"
                    >
                      {c.name[locale]}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── POPULAR / READERS' CHOICE ── */}
      {popular.length >= 3 && (
        <section className="mx-auto max-w-7xl px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-block rounded border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
              {isAz ? "Məşhur xəbərlər" : "Popular news"}
            </span>
            <Link href={`/${locale}`} className="flex items-center gap-1 text-xs text-foreground/60 hover:text-ink">
              {isAz ? "Daha çox" : "View more"} <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
            {/* Big image card */}
            {popular[0] && (
              <Link
                href={href(popular[0])}
                className="group relative block overflow-hidden rounded-2xl bg-ink"
                style={{ minHeight: 320 }}
              >
                <div className="absolute inset-0">
                  <ArticleImage
                    src={popular[0].coverImage?.url}
                    alt={popular[0].coverImage?.alt[locale] ?? title(popular[0])}
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 p-6">
                  <p className="mb-1 text-[10px] font-semibold text-white/50">{tag(popular[0])}</p>
                  <h3 className="text-xl font-extrabold leading-snug text-white">{title(popular[0])}</h3>
                  <p className="mt-2 text-xs text-white/40 line-clamp-2">
                    {popular[0].excerpt[locale] || popular[0].excerpt.az}
                  </p>
                </div>
              </Link>
            )}

            {/* Right: grid of article+thumbnail rows */}
            <div className="grid grid-cols-2 gap-3">
              {popular.slice(1, 9).map((a) => (
                <Link
                  key={a.id}
                  href={href(a)}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-gold/40"
                >
                  <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-background">
                    {a.coverImage ? (
                      <Image src={a.coverImage.url} alt={a.coverImage.alt[locale]} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-ink/60 to-primary/30" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gold">{tag(a)}</p>
                    <p className="text-[12px] font-semibold leading-snug text-foreground group-hover:text-gold line-clamp-2">
                      {title(a)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ChatWidget locale={locale} />
    </div>
  );
}
