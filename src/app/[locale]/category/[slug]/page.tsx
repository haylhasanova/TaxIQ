import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/lib/repositories/categories";
import { listArticlesByCategory } from "@/lib/repositories/articles";
import type { Locale } from "@/i18n/config";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(locale, slug);
  if (!category) notFound();

  const articles = await listArticlesByCategory(category.id, 30).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <span
        className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: category.accentColor }}
      >
        {category.name[locale]}
      </span>
      <p className="mb-8 max-w-2xl text-muted">{category.description[locale]}</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/${locale}/article/${article.slug[locale]}`}
            className="rounded-xl border border-border bg-surface p-4 hover:border-accent"
          >
            <h3 className="font-bold leading-snug">{article.title[locale]}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{article.excerpt[locale]}</p>
          </Link>
        ))}
        {articles.length === 0 && (
          <p className="text-muted">{locale === "az" ? "Hələ məqalə yoxdur." : "No articles yet."}</p>
        )}
      </div>
    </div>
  );
}
