import { adminDb } from "@/lib/firebase/admin";

async function countByStatus(status: string) {
  const snapshot = await adminDb.collection("articles").where("status", "==", status).count().get();
  return snapshot.data().count;
}

export default async function AdminDashboardPage() {
  const [published, scheduled, drafts] = await Promise.all([
    countByStatus("published").catch(() => 0),
    countByStatus("scheduled").catch(() => 0),
    countByStatus("draft").catch(() => 0),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Published", value: published },
          { label: "Scheduled", value: scheduled },
          { label: "Drafts", value: drafts },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-6">
            <p className="text-3xl font-extrabold">{stat.value}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
