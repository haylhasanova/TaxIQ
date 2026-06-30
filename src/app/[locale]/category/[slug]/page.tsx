import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
    <div>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <span
            className="mb-3 inline-block rounded-sm border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ borderColor: category.accentColor, color: category.accentColor }}
          >
            {category.name[locale]}
          </span>
          <p className="max-w-xl text-sm leading-relaxed text-white/55">{category.description[locale]}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/${locale}/article/${article.slug[locale]}`}
              className="group rounded-md border border-border bg-surface p-4 transition-colors hover:border-gold"
            >
              {article.coverImage && (
                <div className="relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-md bg-background">
                  <Image src={article.coverImage.url} alt={article.coverImage.alt[locale]} fill className="object-cover" />
                </div>
              )}
              <h3 className="font-bold leading-snug transition-colors group-hover:text-gold">
                {article.title[locale] || article.title.az}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{article.excerpt[locale] || article.excerpt.az}</p>
            </Link>
          ))}
          {articles.length === 0 && (
            <p className="text-muted">{locale === "az" ? "Hələ məqalə yoxdur." : "No articles yet."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
