"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";

const ACTIONS = [
  { id: "improve", label: "Improve" },
  { id: "continue", label: "Continue writing" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
  { id: "fix_grammar", label: "Fix Azerbaijani grammar" },
  { id: "suggest_headlines", label: "Suggest headlines" },
  { id: "generate_excerpt", label: "Generate excerpt" },
  { id: "suggest_tags", label: "Suggest tags & category" },
] as const;

export function AiAssistPanel({
  getSelectedText,
  getFullText,
  onInsert,
}: {
  getSelectedText: () => string;
  getFullText: () => string;
  onInsert: (text: string) => void;
}) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function runAction(action: string) {
    const text = getSelectedText() || getFullText();
    if (!text.trim()) return;
    setLoading(action);
    setResult(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ action, text, locale: "az" }),
      });
      const data = await res.json();
      setResult(res.ok ? data.result : data.error ?? "Error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <aside className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <p className="text-sm font-bold">AI Assist</p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => runAction(action.id)}
            disabled={loading !== null}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:border-accent disabled:opacity-50"
          >
            {loading === action.id ? "..." : action.label}
          </button>
        ))}
      </div>
      {result && (
        <div className="rounded-lg bg-background p-3 text-sm">
          <p className="whitespace-pre-line">{result}</p>
          <p className="mt-2 text-xs text-muted">AI-generated, review before publishing.</p>
          <button
            type="button"
            onClick={() => onInsert(result)}
            className="mt-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white"
          >
            Insert
          </button>
        </div>
      )}
    </aside>
  );
}
