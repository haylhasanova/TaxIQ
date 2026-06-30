"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Bold,
  Italic,
  UnderlineIcon,
  Heading2,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  TableIcon,
  Upload,
} from "lucide-react";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase/client";
import type { ArticleInput } from "@/lib/validators/article";
import { AiAssistPanel } from "./ai-assist-panel";

interface Category {
  id: string;
  name: { az: string; en: string };
}

interface ArticleEditorProps {
  articleId?: string;
  initialArticle?: ArticleInput;
}

async function authHeaders() {
  const idToken = await auth.currentUser?.getIdToken();
  return {
    "Content-Type": "application/json",
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
  };
}

export function ArticleEditor({ articleId, initialArticle }: ArticleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialArticle?.title.az ?? "");
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt.az ?? "");
  const [categoryId, setCategoryId] = useState(initialArticle?.categoryId ?? "");
  const [tags, setTags] = useState(initialArticle?.tags.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage ?? null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState<"draft" | "publish" | "schedule" | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [publishAt, setPublishAt] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    content: initialArticle?.content.az ?? "",
    extensions: [
      StarterKit.configure({ underline: false }),
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

  async function uploadImage(file: File): Promise<string> {
    const path = `media/${Date.now()}-${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }

  async function handleCoverUpload(file: File) {
    const url = await uploadImage(file);
    setCoverImage({ url, alt: { az: title, en: "" }, width: 1200, height: 675 });
  }

  async function handleInlineUpload(file: File) {
    const url = await uploadImage(file);
    editor?.chain().focus().setImage({ src: url, alt: title }).run();
  }

  function buildPayload(status: ArticleInput["status"]): Record<string, unknown> {
    return {
      title: { az: title, en: initialArticle?.title.en ?? "" },
      slug: {
        az: initialArticle?.slug.az ?? slugify(title),
        en: initialArticle?.slug.en ?? slugify(title),
      },
      excerpt: { az: excerpt, en: initialArticle?.excerpt.en ?? "" },
      content: { az: editor?.getJSON() ?? {}, en: initialArticle?.content.en ?? {} },
      categoryId,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage,
      status,
      ...(status === "scheduled" && publishAt ? { publishAt: new Date(publishAt).toISOString() } : {}),
    };
  }

  async function persist(status: ArticleInput["status"], kind: "draft" | "publish" | "schedule") {
    if (!editor) return;
    setSaving(kind);
    setSaved(null);
    try {
      const headers = await authHeaders();
      const payload = buildPayload(status);
      let id = articleId;
      if (id) {
        await fetch(`/api/admin/articles/${id}`, { method: "PATCH", headers, body: JSON.stringify(payload) });
      } else {
        const res = await fetch("/api/admin/articles", { method: "POST", headers, body: JSON.stringify(payload) });
        const json = await res.json();
        id = json.id;
      }
      if (kind === "publish" && id) {
        await fetch("/api/admin/publish", { method: "POST", headers, body: JSON.stringify({ articleId: id }) });
      }
      setSaved(kind === "draft" ? "Qaralama saxlanıldı" : kind === "publish" ? "Dərc edildi" : "Planlaşdırıldı");
      if (!articleId && id) router.push(`/admin/articles/${id}`);
    } finally {
      setSaving(null);
    }
  }

  if (!editor) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Başlıq / Title"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-xl font-bold outline-none focus-visible:border-gold"
        />
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Qısa təsvir / Excerpt"
          rows={2}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus-visible:border-gold"
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
          >
            <option value="">Kateqoriya seçin</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name.az}</option>
            ))}
          </select>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Teqlər (vergüllə ayrılmış)"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
          />
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Üz şəkli / Cover image</p>
          {coverImage && (
            <img src={coverImage.url} alt="" className="mb-3 h-40 w-full rounded-lg object-cover" />
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverUpload(file);
            }}
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:border-gold hover:text-gold"
          >
            <Upload className="h-3.5 w-3.5" /> Şəkil yüklə
          </button>
        </div>

        <div className="rounded-lg border border-border bg-background">
          <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
            <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              <TableIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => inlineImageInputRef.current?.click()}>
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            <input
              ref={inlineImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleInlineUpload(file);
              }}
            />
          </div>
          <div className="p-4">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-4">
          <button
            type="button"
            onClick={() => persist("draft", "draft")}
            disabled={saving !== null}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted hover:border-gold hover:text-gold disabled:opacity-50"
          >
            {saving === "draft" ? "Saxlanılır..." : "Qaralama saxla"}
          </button>
          <button
            type="button"
            onClick={() => persist("published", "publish")}
            disabled={saving !== null}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving === "publish" ? "Dərc olunur..." : "İndi dərc et"}
          </button>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus-visible:border-gold"
            />
            <button
              type="button"
              onClick={() => persist("scheduled", "schedule")}
              disabled={saving !== null || !publishAt}
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-50"
            >
              {saving === "schedule" ? "Planlaşdırılır..." : "Planlaşdır"}
            </button>
          </div>
          {saved && <span className="text-sm text-accent">{saved}</span>}
        </div>
      </div>
      <AiAssistPanel
        getSelectedText={() => editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          " "
        )}
        getFullText={() => editor.getText()}
        onInsert={(text) => editor.commands.insertContent(text)}
      />
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${
        active ? "bg-gold/15 text-gold" : "text-muted hover:bg-surface hover:text-foreground"
      }`}
    >
      {children}
    </button>
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
