import { listCategories } from "@/lib/repositories/categories";

export default async function AdminCategoriesPage() {
  const categories = await listCategories().catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Categories</h1>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.accentColor }} />
            <p className="font-bold">{category.name.az} / {category.name.en}</p>
          </div>
        ))}
        {categories.length === 0 && <p className="text-muted">No categories yet. Run the seed script.</p>}
      </div>
    </div>
  );
}
