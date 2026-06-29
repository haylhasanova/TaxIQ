import { notFound } from "next/navigation";
import { getAnnouncementById } from "@/lib/repositories/announcements";
import { AnnouncementEditor } from "@/components/admin/announcement-editor";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Elanı redaktə et</h1>
        <p className="text-sm text-muted">{announcement.title.az || "(başlıqsız)"}</p>
      </div>
      <AnnouncementEditor announcementId={id} initialAnnouncement={announcement} />
    </div>
  );
}
