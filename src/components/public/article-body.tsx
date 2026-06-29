export function ArticleBody({ html }: { html: string }) {
  if (!html) return null;
  return (
    <div
      className="prose prose-neutral mt-6 max-w-none dark:prose-invert"
      // contentHtml is sanitized server-side before being cached on the article document.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
