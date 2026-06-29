import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">{t("about")}</h1>
      <p className="mt-4 text-muted">
        {locale === "az"
          ? "TaxIQ — maliyyə, vergi və mühasibatlıq sahəsində xəbər və analitika platformasıdır."
          : "TaxIQ is a finance, tax, and accounting news and analysis platform."}
      </p>
    </div>
  );
}
