import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export function SiteFooter() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const isAz = locale === "az";

  return (
    <footer className="mt-8 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href={`/${locale}`} className="text-base font-extrabold tracking-tight">
            Tax<span className="text-gold">IQ</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            {isAz
              ? "Azərbaycanda vergi, maliyyə və mühasibatlıq sahəsindəki ən son xəbərlər və peşəkar tövsiyələr."
              : "Latest news and professional guidance in finance, tax, and accounting in Azerbaijan."}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
            {isAz ? "Naviqasiya" : "Navigation"}
          </h4>
          <div className="flex flex-col gap-2 text-sm text-foreground/70">
            <Link href={`/${locale}`} className="hover:text-ink">{t("home")}</Link>
            <Link href={`/${locale}/announcements`} className="hover:text-ink">{t("announcements")}</Link>
            <Link href={`/${locale}/search`} className="hover:text-ink">{t("search")}</Link>
            <Link href={`/${locale}/about`} className="hover:text-ink">{t("about")}</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
            {isAz ? "Kateqoriyalar" : "Categories"}
          </h4>
          <div className="flex flex-col gap-2 text-sm text-foreground/70">
            <Link href={`/${locale}/category/vergi`} className="hover:text-ink">{t("tax")}</Link>
            <Link href={`/${locale}/category/maliyye`} className="hover:text-ink">{t("finance")}</Link>
            <Link href={`/${locale}/category/muhasibatliq`} className="hover:text-ink">{t("accounting")}</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
            {isAz ? "Əlaqə" : "Contact"}
          </h4>
          <div className="flex flex-col gap-2 text-sm text-foreground/70">
            <span>Bakı, Azərbaycan</span>
            <a href="mailto:info@taxiq.az" className="hover:text-ink">info@taxiq.az</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-5 py-4 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} TaxIQ. {isAz ? "Bütün hüquqlar qorunur." : "All rights reserved."}
      </div>
    </footer>
  );
}
