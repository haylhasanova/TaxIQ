import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { listPublishedArticles } from "@/lib/repositories/articles";
import type { Locale } from "@/i18n/config";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = await getTranslations("nav");

  const articles = q ? await listPublishedArticles(50) : [];
  const query = q?.toLowerCase().trim() ?? "";
  const results = query
    ? articles.filter((article) =>
        `${article.title[locale]} ${article.excerpt[locale]} ${article.tags.join(" ")}`
          .toLowerCase()
          .includes(query)
      )
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold">{t("search")}</h1>
      <form className="mb-8">
        <input
          name="q"
          defaultValue={q}
          placeholder={t("search")}
          className="w-full rounded-full border border-border bg-background px-4 py-3 outline-none focus-visible:border-accent"
        />
      </form>
      <div className="space-y-4">
        {results.map((article) => (
          <Link
            key={article.id}
            href={`/${locale}/article/${article.slug[locale]}`}
            className="block rounded-xl border border-border bg-surface p-4 hover:border-accent"
          >
            <h3 className="font-bold">{article.title[locale]}</h3>
            <p className="mt-1 text-sm text-muted">{article.excerpt[locale]}</p>
          </Link>
        ))}
        {q && results.length === 0 && <p className="text-muted">{t("search")}: 0</p>}
      </div>
    </div>
  );
}
