"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { auth } from "@/lib/firebase/client";
import { AiAssistPanel } from "./ai-assist-panel";

export function ArticleEditor() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ HTMLAttributes: { rel: "nofollow noopener" } }),
      TiptapImage,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem,
      Placeholder.configure({ placeholder: "Məqaləni yazmağa başlayın... / Start writing..." }),
    ],
    editorProps: {
      attributes: { class: "prose prose-neutral max-w-none min-h-[300px] focus:outline-none dark:prose-invert" },
    },
  });

  async function handleSaveDraft() {
    if (!editor) return;
    setSaving(true);
    setSaved(false);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          title: { az: title, en: "" },
          slug: { az: slugify(title), en: slugify(title) },
          excerpt: { az: excerpt, en: "" },
          content: { az: editor.getJSON(), en: {} },
          categoryId: "",
          status: "draft",
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Başlıq / Title"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-xl font-bold outline-none focus-visible:border-accent"
        />
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Qısa təsvir / Excerpt"
          rows={2}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus-visible:border-accent"
        />
        <div className="rounded-lg border border-border bg-background p-4">
          <EditorContent editor={editor} />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save draft"}
          </button>
          {saved && <span className="text-sm text-accent">Saved</span>}
        </div>
      </div>
      <AiAssistPanel
        getSelectedText={() => editor?.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          " "
        ) ?? ""}
        getFullText={() => editor?.getText() ?? ""}
        onInsert={(text) => editor?.commands.insertContent(text)}
      />
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[əğıöüçş]/g, (c) => ({ ə: "e", ğ: "g", ı: "i", ö: "o", ü: "u", ç: "c", ş: "s" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
