import { adminDb } from "@/lib/firebase/admin";
import type { AnnouncementInput } from "@/lib/validators/announcement";

export default async function AdminAnnouncementsPage() {
  const snapshot = await adminDb.collection("announcements").orderBy("updatedAt", "desc").limit(50).get();
  const announcements = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as AnnouncementInput),
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Announcements</h1>
      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
            <p className="font-bold">{a.title?.az ?? "—"}</p>
            <p className="text-sm text-muted">{a.type} · {a.status}</p>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-muted">No announcements yet.</p>}
      </div>
    </div>
  );
}
