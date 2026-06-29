import Link from "next/link";
import { Plus, Pin } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import type { AnnouncementInput } from "@/lib/validators/announcement";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted/15 text-muted",
  in_review: "bg-warning/15 text-warning",
  scheduled: "bg-gold/15 text-gold",
  published: "bg-accent/15 text-accent",
  archived: "bg-danger/15 text-danger",
};

const TYPE_LABELS: Record<string, string> = {
  deadline: "Son tarix",
  event: "Tədbir",
  notice: "Bildiriş",
  regulation: "Tənzimləmə",
};

export default async function AdminAnnouncementsPage() {
  const snapshot = await adminDb.collection("announcements").orderBy("updatedAt", "desc").limit(50).get();
  const announcements = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as AnnouncementInput),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Elanlar</h1>
          <p className="text-sm text-muted">Son tarixlər, tədbirlər və rəsmi bildirişlər</p>
        </div>
        <Link
          href="/admin/announcements/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni elan
        </Link>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-background">
        {announcements.map((a) => (
          <Link
            key={a.id}
            href={`/admin/announcements/${a.id}`}
            className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface"
          >
            <div className="flex min-w-0 items-center gap-2">
              {a.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-gold" />}
              <span className="truncate text-sm font-semibold">{a.title?.az || "(başlıqsız)"}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-bold uppercase text-muted">
                {TYPE_LABELS[a.type] ?? a.type}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  STATUS_STYLES[a.status] ?? "bg-muted/15 text-muted"
                }`}
              >
                {a.status}
              </span>
            </div>
          </Link>
        ))}
        {announcements.length === 0 && <p className="px-5 py-10 text-center text-muted">Hələ elan yoxdur.</p>}
      </div>
    </div>
  );
}
