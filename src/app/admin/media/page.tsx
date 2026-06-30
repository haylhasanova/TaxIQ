import { ImageIcon } from "lucide-react";
import { adminStorage } from "@/lib/firebase/admin";

async function listMedia() {
  const bucket = adminStorage.bucket();
  const [files] = await bucket.getFiles({ prefix: "media/", maxResults: 60 });
  const items = await Promise.all(
    files
      .filter((file) => !file.name.endsWith("/"))
      .map(async (file) => {
        const [url] = await file.getSignedUrl({ action: "read", expires: Date.now() + 1000 * 60 * 60 });
        return { name: file.name, url, updated: file.metadata.updated as string | undefined };
      })
  );
  return items.sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""));
}

export default async function AdminMediaPage() {
  const items = await listMedia().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Media kitabxanası</h1>
        <p className="text-sm text-muted">
          Şəkillər məqalə və elan redaktorlarından yüklənir. Aşağıda son yüklənmiş fayllar göstərilir.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-xl border border-border bg-background"
          >
            <img src={item.url} alt="" className="aspect-square w-full object-cover transition-opacity group-hover:opacity-80" />
          </a>
        ))}
        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-muted">
            <ImageIcon className="h-6 w-6" />
            <p>Hələ şəkil yüklənməyib.</p>
          </div>
        )}
      </div>
    </div>
  );
}
