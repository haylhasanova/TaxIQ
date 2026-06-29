import Link from "next/link";
import { FileText, Clock, PenLine, Megaphone, Plus, ArrowUpRight } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import type { ArticleInput } from "@/lib/validators/article";

async function countByStatus(collection: string, status: string) {
  const snapshot = await adminDb.collection(collection).where("status", "==", status).count().get();
  return snapshot.data().count;
}

async function recentArticles() {
  const snapshot = await adminDb.collection("articles").orderBy("updatedAt", "desc").limit(5).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ArticleInput) }));
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted/15 text-muted",
  in_review: "bg-warning/15 text-warning",
  scheduled: "bg-gold/15 text-gold",
  published: "bg-accent/15 text-accent",
  archived: "bg-danger/15 text-danger",
};

export default async function AdminDashboardPage() {
  const [published, scheduled, drafts, announcements, recent] = await Promise.all([
    countByStatus("articles", "published").catch(() => 0),
    countByStatus("articles", "scheduled").catch(() => 0),
    countByStatus("articles", "draft").catch(() => 0),
    countByStatus("announcements", "published").catch(() => 0),
    recentArticles().catch(() => []),
  ]);

  const stats = [
    { label: "Dərc olunmuş", value: published, icon: FileText, tone: "text-accent" },
    { label: "Planlaşdırılmış", value: scheduled, icon: Clock, tone: "text-gold" },
    { label: "Qaralama", value: drafts, icon: PenLine, tone: "text-muted" },
    { label: "Aktiv elanlar", value: announcements, icon: Megaphone, tone: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-muted">Redaksiya fəaliyyətinə ümumi baxış</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni məqalə
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-background p-5">
              <div className="mb-3 flex items-center justify-between">
                <Icon className={`h-5 w-5 ${stat.tone}`} />
              </div>
              <p className="text-3xl font-extrabold">{stat.value}</p>
              <p className="text-sm text-muted">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Son fəaliyyət</h2>
          <Link href="/admin/articles" className="flex items-center gap-1 text-xs font-semibold text-gold hover:underline">
            Hamısına bax <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.map((article) => (
            <Link
              key={article.id}
              href={`/admin/articles/${article.id}`}
              className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-surface"
            >
              <span className="truncate text-sm font-semibold">{article.title?.az || "(başlıqsız)"}</span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  STATUS_STYLES[article.status] ?? "bg-muted/15 text-muted"
                }`}
              >
                {article.status}
              </span>
            </Link>
          ))}
          {recent.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">Hələ məqalə yoxdur.</p>}
        </div>
      </div>
    </div>
  );
}
