"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/lib/firebase/client";

export function CategoryCreateForm() {
  const router = useRouter();
  const [nameAz, setNameAz] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slugAz, setSlugAz] = useState("");
  const [slugEn, setSlugEn] = useState("");
  const [accentColor, setAccentColor] = useState("#1e3a8a");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          name: { az: nameAz, en: nameEn },
          slug: { az: slugAz, en: slugEn },
          accentColor,
          order,
        }),
      });
      if (!res.ok) {
        setError("Kateqoriya yaradılmadı");
        return;
      }
      setNameAz("");
      setNameEn("");
      setSlugAz("");
      setSlugEn("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <p className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Yeni kateqoriya</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={nameAz}
          onChange={(e) => setNameAz(e.target.value)}
          placeholder="Ad (AZ)"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
        />
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="Name (EN)"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
        />
        <input
          value={slugAz}
          onChange={(e) => setSlugAz(e.target.value)}
          placeholder="slug-az"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
        />
        <input
          value={slugEn}
          onChange={(e) => setSlugEn(e.target.value)}
          placeholder="slug-en"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
        />
        <input
          type="color"
          value={accentColor}
          onChange={(e) => setAccentColor(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-background"
        />
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          placeholder="Sıra"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-gold"
        />
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <button
        type="button"
        onClick={handleCreate}
        disabled={saving || !nameAz || !slugAz}
        className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        {saving ? "Yaradılır..." : "Əlavə et"}
      </button>
    </div>
  );
}
