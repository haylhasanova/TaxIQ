import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
    <article className="mx-auto max-w-2xl px-4 py-10">
      {!hasTranslation && (
        <p className="mb-4 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          {locale === "az" ? "Tərcümə gözləyir" : "Translation pending"}
        </p>
      )}
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
        {article.title[locale] || article.title.az}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {t("readingTime", { minutes: article.readingMinutes })}
      </p>

      {article.coverImage && (
        <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface">
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
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <Link href={`/${locale}`} className="mt-10 inline-block text-sm font-semibold text-accent">
        ← {locale === "az" ? "Əsas səhifəyə qayıt" : "Back to home"}
      </Link>
    </article>
  );
}
