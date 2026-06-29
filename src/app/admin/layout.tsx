import Link from "next/link";
import { requireAdminSession } from "@/lib/auth-admin-guard";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession(["author", "editor", "super_admin"]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-surface p-4">
        <p className="mb-6 text-lg font-extrabold text-primary">TaxIQ Admin</p>
        <nav className="flex flex-col gap-2 text-sm font-semibold">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 hover:bg-background">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="text-sm text-muted">{session.email}</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
            {session.role}
          </span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
