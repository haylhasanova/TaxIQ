import Link from "next/link";
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${locale}`} className="text-xl font-extrabold tracking-tight text-primary">
          TaxIQ
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-foreground/80 hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeToggle />
          <Link
            href={`/${locale}/sign-in`}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    </header>
  );
}
