import { z } from "zod";
import { localizedStringSchema, contentStatusSchema } from "./common";

export const announcementSchema = z.object({
  title: localizedStringSchema,
  body: z.object({ az: z.any(), en: z.any() }),
  type: z.enum(["deadline", "event", "notice", "regulation"]),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
  effectiveDate: z.coerce.date().nullable().optional(),
  status: contentStatusSchema.default("draft"),
  publishAt: z.coerce.date().nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  pinned: z.boolean().default(false),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
