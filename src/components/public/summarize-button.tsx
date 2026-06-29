"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";

export function SummarizeButton({ articleId, locale }: { articleId: string; locale: Locale }) {
  const t = useTranslations("article");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, locale }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setSummary(data.summary);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface p-4">
      {!summary && (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "..." : t("summarizeWithAi")}
        </button>
      )}
      {summary && (
        <div>
          <p className="whitespace-pre-line text-sm">{summary}</p>
          <p className="mt-3 text-xs text-muted">{t("aiSummaryDisclaimer")}</p>
        </div>
      )}
      {error && <p className="text-sm text-danger">{t("aiSummaryDisclaimer")}</p>}
    </div>
  );
}
