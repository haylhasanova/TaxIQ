import { getTranslations } from "next-intl/server";
import { Pin } from "lucide-react";
import { listPublishedAnnouncements } from "@/lib/repositories/announcements";
import type { Locale } from "@/i18n/config";

export const revalidate = 60;

const SEVERITY_STYLES: Record<string, string> = {
  info: "border-border bg-surface",
  warning: "border-warning/40 bg-warning/10",
  critical: "border-danger/40 bg-danger/10",
};

const TYPE_LABELS_AZ: Record<string, string> = {
  deadline: "Son tarix",
  event: "Tədbir",
  notice: "Bildiriş",
  regulation: "Tənzimləmə",
};

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("announcements");
  const isAz = locale === "az";
  const announcements = await listPublishedAnnouncements().catch(() => []);

  return (
    <div>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-sm text-white/50">
            {isAz ? "Son tarixlər, tədbirlər və rəsmi bildirişlər" : "Deadlines, events, and official notices"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-col gap-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`rounded-md border p-4 ${SEVERITY_STYLES[announcement.severity] ?? SEVERITY_STYLES.info}`}
            >
              <div className="flex items-center gap-2">
                {announcement.pinned && (
                  <span className="flex items-center gap-1 text-xs font-bold uppercase text-gold">
                    <Pin size={12} /> {t("pinned")}
                  </span>
                )}
                <span className="rounded-sm bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                  {isAz ? TYPE_LABELS_AZ[announcement.type] ?? announcement.type : announcement.type}
                </span>
              </div>
              <h2 className="mt-2 font-bold leading-snug">{announcement.title[locale] || announcement.title.az}</h2>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-muted">{isAz ? "Hələ elan yoxdur." : "No announcements yet."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
