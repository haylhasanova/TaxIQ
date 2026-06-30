import Link from "next/link";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();

  const navItems = [
    { href: `/${locale}/category/maliyye`, label: t("finance") },
    { href: `/${locale}/category/vergi`, label: t("tax") },
    { href: `/${locale}/category/muhasibatliq`, label: t("accounting") },
    { href: `/${locale}/announcements`, label: t("announcements") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ink text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3.5">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-gold text-[11px] font-bold uppercase tracking-tight text-gold">
            tax
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Tax<span className="text-gold">IQ</span>
          </span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 text-sm font-semibold lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeToggle />
          <Link
            href={`/${locale}/search`}
            aria-label={t("search")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Search size={16} />
          </Link>
          <Link
            href={`/${locale}/sign-in`}
            className="hidden rounded-md bg-gold px-4 py-2 text-sm font-bold text-ink transition-opacity hover:opacity-90 sm:block"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 text-sm font-semibold lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-md px-3 py-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
