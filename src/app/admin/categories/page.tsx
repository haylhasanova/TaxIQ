import { listCategories } from "@/lib/repositories/categories";
import { CategoryCreateForm } from "@/components/admin/category-create-form";

export default async function AdminCategoriesPage() {
  const categories = await listCategories().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Kateqoriyalar</h1>
        <p className="text-sm text-muted">Sayt naviqasiyasını idarə edin</p>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-background">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-3 px-5 py-3.5">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.accentColor }} />
            <p className="font-semibold">
              {category.name.az} <span className="text-muted">/ {category.name.en}</span>
            </p>
          </div>
        ))}
        {categories.length === 0 && <p className="px-5 py-10 text-center text-muted">Hələ kateqoriya yoxdur.</p>}
      </div>

      <CategoryCreateForm />
    </div>
  );
}
