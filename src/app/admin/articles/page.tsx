import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import type { ArticleInput } from "@/lib/validators/article";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted/15 text-muted",
  in_review: "bg-warning/15 text-warning",
  scheduled: "bg-gold/15 text-gold",
  published: "bg-accent/15 text-accent",
  archived: "bg-danger/15 text-danger",
};

export default async function AdminArticlesPage() {
  const snapshot = await adminDb.collection("articles").orderBy("updatedAt", "desc").limit(50).get();
  const articles = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ArticleInput),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Məqalələr</h1>
          <p className="text-sm text-muted">Bütün məqalələrin idarəsi</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni məqalə
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs font-bold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3">Başlıq (AZ)</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Kateqoriya</th>
              <th className="w-10 px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((article) => (
              <tr key={article.id} className="group transition-colors hover:bg-surface">
                <td className="px-5 py-3.5 font-semibold">
                  <Link href={`/admin/articles/${article.id}`} className="block">
                    {article.title?.az || "(başlıqsız)"}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      STATUS_STYLES[article.status] ?? "bg-muted/15 text-muted"
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted">{article.categoryId || "—"}</td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/articles/${article.id}`} className="text-muted group-hover:text-gold">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted">
                  Hələ məqalə yoxdur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
