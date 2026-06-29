import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import type { ArticleInput } from "@/lib/validators/article";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted/20 text-muted",
  in_review: "bg-warning/20 text-warning",
  scheduled: "bg-accent/20 text-accent",
  published: "bg-primary/20 text-primary",
  archived: "bg-danger/20 text-danger",
};

export default async function AdminArticlesPage() {
  const snapshot = await adminDb.collection("articles").orderBy("updatedAt", "desc").limit(50).get();
  const articles = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ArticleInput),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Articles</h1>
        <Link href="/admin/articles/new" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
          New article
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title (AZ)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{article.title?.az ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${STATUS_COLORS[article.status] ?? ""}`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{article.categoryId}</td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted">
                  No articles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
