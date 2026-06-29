import { z } from "zod";
import { localizedStringSchema, localizedSlugSchema } from "./common";

export const categorySchema = z.object({
  slug: localizedSlugSchema,
  name: localizedStringSchema,
  description: localizedStringSchema.partial().default({}),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  order: z.number().int().default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
