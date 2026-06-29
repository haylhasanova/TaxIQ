import { ArticleEditor } from "@/components/admin/article-editor";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">New article</h1>
      <ArticleEditor />
    </div>
  );
}
