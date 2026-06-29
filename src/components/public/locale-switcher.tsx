"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { locales } from "@/i18n/config";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(nextLocale: string) {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || "/");
  }

  return (
    <div className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-current={l === locale}
          className={
            l === locale
              ? "text-accent"
              : "text-muted hover:text-foreground transition-colors"
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
