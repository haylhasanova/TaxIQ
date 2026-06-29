import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export function SiteFooter() {
  const locale = useLocale();
  const t = useTranslations("nav");

  return (
    <footer className="border-t border-border py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} TaxIQ</p>
        <div className="flex gap-4">
          <Link href={`/${locale}/about`}>{t("about")}</Link>
          <Link href={`/${locale}/search`}>{t("search")}</Link>
        </div>
      </div>
    </footer>
  );
}
