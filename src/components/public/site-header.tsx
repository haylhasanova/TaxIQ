import Link from "next/link";
import { Search } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { LocaleSwitcher } from "./locale-switcher";

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();

  const navItems = [
    { href: `/${locale}`, label: locale === "az" ? "Hamısı" : "All" },
    { href: `/${locale}/category/vergi`, label: t("tax") },
    { href: `/${locale}/category/maliyye`, label: t("finance") },
    { href: `/${locale}/category/muhasibatliq`, label: t("accounting") },
    { href: `/${locale}/announcements`, label: t("announcements") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2 mr-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-ink text-[10px] font-extrabold uppercase text-ink">
            IQ
          </span>
          <span className="hidden text-base font-extrabold tracking-tight text-ink sm:block">
            Tax<span className="text-gold">IQ</span>
          </span>
        </Link>

        {/* Pill nav */}
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground/70 transition-colors hover:border-ink hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher />
          <Link
            href={`/${locale}/search`}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted transition-colors hover:border-ink"
          >
            <Search size={14} />
            <span className="hidden text-sm sm:block">
              {locale === "az" ? "Məqalə axtar..." : "Search articles..."}
            </span>
          </Link>
          <Link
            href={`/${locale}/sign-in`}
            className="rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-80"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground/70 transition-colors hover:border-ink hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
