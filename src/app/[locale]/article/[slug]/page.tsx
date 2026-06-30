import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getArticleBySlug, incrementViews } from "@/lib/repositories/articles";
import { ArticleBody } from "@/components/public/article-body";
import { SummarizeButton } from "@/components/public/summarize-button";
import type { Locale } from "@/i18n/config";

export const revalidate = 60;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(locale, slug);
  if (!article) notFound();

  const t = await getTranslations("article");
  void incrementViews(article.id).catch(() => null);

  const hasTranslation = Boolean(article.title[locale]?.trim());

  return (
    <article>
      <header className="bg-ink pb-10 pt-10 text-white">
        <div className="mx-auto max-w-2xl px-4">
          <Link
            href={`/${locale}`}
            className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={13} />
            {locale === "az" ? "Geri qayıt" : "Go back"}
          </Link>
          {article.tags[0] && (
            <span className="mb-4 inline-block rounded-sm border border-gold/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
              {article.tags[0]}
            </span>
          )}
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            {article.title[locale] || article.title.az}
          </h1>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/35">
            {t("readingTime", { minutes: article.readingMinutes })}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {!hasTranslation && (
          <p className="mb-6 rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            {locale === "az" ? "Tərcümə gözləyir" : "Translation pending"}
          </p>
        )}

        {article.coverImage && (
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-md bg-surface">
            <Image
              src={article.coverImage.url}
              alt={article.coverImage.alt[locale]}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        <SummarizeButton articleId={article.id} locale={locale} />

        <ArticleBody html={article.contentHtml[locale] ?? article.contentHtml.az ?? ""} />

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-sm bg-surface px-3 py-1 text-xs font-semibold text-muted">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
