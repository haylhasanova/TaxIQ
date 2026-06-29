import { z } from "zod";
import { localizedStringSchema, localizedSlugSchema, contentStatusSchema } from "./common";

export const articleSchema = z.object({
  title: localizedStringSchema,
  slug: localizedSlugSchema,
  excerpt: localizedStringSchema,
  content: z.object({ az: z.any(), en: z.any() }),
  contentHtml: localizedStringSchema.partial().default({}),
  coverImage: z
    .object({
      url: z.string().url(),
      alt: localizedStringSchema,
      width: z.number(),
      height: z.number(),
    })
    .nullable()
    .default(null),
  categoryId: z.string().min(1),
  tags: z.array(z.string()).default([]),
  authorId: z.string().min(1),
  status: contentStatusSchema.default("draft"),
  publishAt: z.coerce.date().nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  featured: z.boolean().default(false),
  readingMinutes: z.number().int().nonnegative().default(0),
  views: z.number().int().nonnegative().default(0),
  aiSummary: localizedStringSchema.partial().optional(),
  seo: z
    .object({
      metaTitle: localizedStringSchema,
      metaDescription: localizedStringSchema,
      ogImage: z.string().url().optional(),
    })
    .optional(),
});

export type ArticleInput = z.infer<typeof articleSchema>;
