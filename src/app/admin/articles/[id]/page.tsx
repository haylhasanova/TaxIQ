import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/repositories/articles";
import { ArticleEditor } from "@/components/admin/article-editor";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Məqaləni redaktə et</h1>
        <p className="text-sm text-muted">{article.title.az || "(başlıqsız)"}</p>
      </div>
      <ArticleEditor articleId={id} initialArticle={article} />
    </div>
  );
}
