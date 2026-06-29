export const locales = ["az", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "az";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
