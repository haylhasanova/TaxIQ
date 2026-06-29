import Link from "next/link";
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  FolderTree,
  Image as ImageIcon,
  Users,
  ExternalLink,
} from "lucide-react";
import { requireAdminSession } from "@/lib/auth-admin-guard";
import { SignOutButton } from "@/components/admin/sign-out-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Məqalələr", icon: Newspaper },
  { href: "/admin/announcements", label: "Elanlar", icon: Megaphone },
  { href: "/admin/categories", label: "Kateqoriyalar", icon: FolderTree },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/users", label: "İstifadəçilər", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession(["author", "editor", "super_admin"]);

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-ink text-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-gold">
            <span className="font-mono text-xs font-bold text-gold">TIQ</span>
          </div>
          <div>
            <p className="text-base font-extrabold leading-tight">
              Tax<span className="text-gold">IQ</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Redaksiya Paneli</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4 shrink-0 text-white/40 group-hover:text-gold" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/az"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Saytı görüntülə
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
          <div>
            <p className="text-sm font-semibold">{session.email}</p>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
              {session.role.replace("_", " ")}
            </span>
          </div>
          <SignOutButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
