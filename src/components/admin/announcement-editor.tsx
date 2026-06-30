"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { auth } from "@/lib/firebase/client";
import type { AnnouncementInput } from "@/lib/validators/announcement";

interface AnnouncementEditorProps {
  announcementId?: string;
  initialAnnouncement?: AnnouncementInput;
}

async function authHeaders() {
  const idToken = await auth.currentUser?.getIdToken();
  return {
    "Content-Type": "application/json",
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
  };
}

export function AnnouncementEditor({ announcementId, initialAnnouncement }: AnnouncementEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialAnnouncement?.title.az ?? "");
  const [type, setType] = useState(initialAnnouncement?.type ?? "notice");
  const [severity, setSeverity] = useState(initialAnnouncement?.severity ?? "info");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [pinned, setPinned] = useState(initialAnnouncement?.pinned ?? false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    content: initialAnnouncement?.body.az ?? "",
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Elanın mətni... / Announcement text..." }),
    ],
    editorProps: {
      attributes: { class: "prose prose-neutral max-w-none min-h-[200px] focus:outline-none dark:prose-invert" },
    },
  });

  async function persist(status: "draft" | "published", kind: "draft" | "publish") {
    if (!editor) return;
    setSaving(kind);
    setSaved(null);
    try {
      const headers = await authHeaders();
      const payload = {
        title: { az: title, en: initialAnnouncement?.title.en ?? "" },
        body: { az: editor.getJSON(), en: initialAnnouncement?.body.en ?? {} },
        type,
        severity,
        effectiveDate: effectiveDate || null,
        pinned,
        status,
      };
      let id = announcementId;
      if (id) {
        await fetch(`/api/admin/announcements/${id}`, { method: "PATCH", headers, body: JSON.stringify(payload) });
      } else {
        const res = await fetch("/api/admin/announcements", { method: "POST", headers, body: JSON.stringify(payload) });
        const json = await res.json();
        id = json.id;
      }
      if (kind === "publish" && id) {
        await fetch("/api/admin/announcements/publish", { method: "POST", headers, body: JSON.stringify({ announcementId: id }) });
      }
      setSaved(kind === "draft" ? "Qaralama saxlanıldı" : "Dərc edildi");
      if (!announcementId && id) router.push(`/admin/announcements/${id}`);
    } finally {
      setSaving(null);
    }
  }

  if (!editor) return null;

  return (
    <div className="max-w-2xl space-y-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Başlıq / Title"
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-lg font-bold outline-none focus-visible:border-gold"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
        >
          <option value="deadline">Son tarix</option>
          <option value="event">Tədbir</option>
          <option value="notice">Bildiriş</option>
          <option value="regulation">Tənzimləmə</option>
        </select>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as typeof severity)}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
        >
          <option value="info">Məlumat</option>
          <option value="warning">Xəbərdarlıq</option>
          <option value="critical">Kritik</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="date"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
        />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          Yuxarıda sabitlə
        </label>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center gap-3">
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
          {saving === "publish" ? "Dərc olunur..." : "Dərc et"}
        </button>
        {saved && <span className="text-sm text-accent">{saved}</span>}
      </div>
    </div>
  );
}
