import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export function SiteFooter() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const isAz = locale === "az";

  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-lg font-extrabold tracking-tight">
            Tax<span className="text-gold">IQ</span>
          </span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/40">
            {isAz
              ? "Azərbaycanda vergi, maliyyə və mühasibatlıq sahəsindəki ən son xəbərlər, qanunvericilik dəyişiklikləri və peşəkar tövsiyələr."
              : "Latest news, legislation changes, and professional guidance in finance, tax, and accounting in Azerbaijan."}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/30">
            {isAz ? "Naviqasiya" : "Navigation"}
          </h4>
          <div className="flex flex-col gap-2 text-sm text-white/50">
            <Link href={`/${locale}`} className="transition-colors hover:text-white">{t("home")}</Link>
            <Link href={`/${locale}/announcements`} className="transition-colors hover:text-white">{t("announcements")}</Link>
            <Link href={`/${locale}/search`} className="transition-colors hover:text-white">{t("search")}</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/30">
            {t("home") === "Home" ? "Categories" : "Kateqoriyalar"}
          </h4>
          <div className="flex flex-col gap-2 text-sm text-white/50">
            <Link href={`/${locale}/category/vergi`} className="transition-colors hover:text-white">{t("tax")}</Link>
            <Link href={`/${locale}/category/maliyye`} className="transition-colors hover:text-white">{t("finance")}</Link>
            <Link href={`/${locale}/category/muhasibatliq`} className="transition-colors hover:text-white">{t("accounting")}</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/30">
            {t("about")}
          </h4>
          <div className="flex flex-col gap-2 text-sm text-white/50">
            <Link href={`/${locale}/about`} className="transition-colors hover:text-white">{t("about")}</Link>
            <span>Bakı, Azərbaycan</span>
            <a href="mailto:info@taxiq.az" className="transition-colors hover:text-white">info@taxiq.az</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/30">
        &copy; {new Date().getFullYear()} TaxIQ. {isAz ? "Bütün hüquqlar qorunur." : "All rights reserved."}
      </div>
    </footer>
  );
}
