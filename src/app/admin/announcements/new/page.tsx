import { AnnouncementEditor } from "@/components/admin/announcement-editor";

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Yeni elan</h1>
        <p className="text-sm text-muted">Son tarix, tədbir, bildiriş və ya tənzimləmə elanı yaradın</p>
      </div>
      <AnnouncementEditor />
    </div>
  );
}
