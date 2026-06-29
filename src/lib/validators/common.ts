import { z } from "zod";

export const localizedStringSchema = z.object({
  az: z.string(),
  en: z.string(),
});

export const localizedSlugSchema = z.object({
  az: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, hyphen-separated"),
  en: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, hyphen-separated"),
});

export const contentStatusSchema = z.enum([
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
]);

export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type Locale = "az" | "en";
