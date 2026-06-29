import { getTranslations } from "next-intl/server";
import { listPublishedAnnouncements } from "@/lib/repositories/announcements";
import type { Locale } from "@/i18n/config";

export const revalidate = 60;

const SEVERITY_STYLES: Record<string, string> = {
  info: "border-border bg-surface",
  warning: "border-warning bg-warning/10",
  critical: "border-danger bg-danger/10",
};

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("announcements");
  const announcements = await listPublishedAnnouncements().catch(() => []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold">{t("title")}</h1>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`rounded-xl border p-4 ${SEVERITY_STYLES[announcement.severity]}`}
          >
            <div className="flex items-center gap-2">
              {announcement.pinned && (
                <span className="text-xs font-bold uppercase text-accent">{t("pinned")}</span>
              )}
              <span className="text-xs font-semibold uppercase text-muted">{announcement.type}</span>
            </div>
            <h2 className="mt-1 font-bold">{announcement.title[locale]}</h2>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-muted">{locale === "az" ? "Hələ elan yoxdur." : "No announcements yet."}</p>
        )}
      </div>
    </div>
  );
}
