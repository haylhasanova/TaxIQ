import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { listScheduledDue as listScheduledArticles, publishArticle } from "@/lib/repositories/articles";
import { listScheduledDue as listScheduledAnnouncements, publishAnnouncement } from "@/lib/repositories/announcements";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const [dueArticles, dueAnnouncements] = await Promise.all([
    listScheduledArticles(now),
    listScheduledAnnouncements(now),
  ]);

  await Promise.all(dueArticles.map((article) => publishArticle(article.id)));
  await Promise.all(dueAnnouncements.map((announcement) => publishAnnouncement(announcement.id)));

  for (const locale of ["az", "en"]) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/announcements`);
    for (const article of dueArticles) {
      revalidatePath(`/${locale}/article/${article.slug[locale as "az" | "en"]}`);
    }
  }

  return NextResponse.json({
    publishedArticles: dueArticles.length,
    publishedAnnouncements: dueAnnouncements.length,
  });
}
