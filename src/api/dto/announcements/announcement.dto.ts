import { z } from "zod";
import {
  ANNOUNCEMENT_LOCALES,
} from "@src/domain/entities/Announcement.entity";

const translationSchema = z.object({
  locale: z.enum(ANNOUNCEMENT_LOCALES),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
  ctaLabel: z.string().trim().min(1).max(100).nullable().optional(),
  ctaHref: z.string().trim().min(1).max(500).nullable().optional(),
});

const optionalDate = z
  .union([z.string().datetime(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Date(value);
  });

export const createAnnouncementSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
    priority: z.number().int().min(0).max(1000).optional(),
    startsAt: optionalDate,
    endsAt: optionalDate,
    translations: z.array(translationSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const locales = data.translations.map((t) => t.locale);
    if (new Set(locales).size !== locales.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate translation locale",
        path: ["translations"],
      });
    }

    if (
      data.startsAt instanceof Date &&
      data.endsAt instanceof Date &&
      data.endsAt <= data.startsAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endsAt must be after startsAt",
        path: ["endsAt"],
      });
    }
  });

export const updateAnnouncementSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case")
      .optional(),
    priority: z.number().int().min(0).max(1000).optional(),
    startsAt: optionalDate,
    endsAt: optionalDate,
    translations: z.array(translationSchema).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.translations) {
      const locales = data.translations.map((t) => t.locale);
      if (new Set(locales).size !== locales.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate translation locale",
          path: ["translations"],
        });
      }
    }

    if (
      data.startsAt instanceof Date &&
      data.endsAt instanceof Date &&
      data.endsAt <= data.startsAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endsAt must be after startsAt",
        path: ["endsAt"],
      });
    }
  });

export const getActiveAnnouncementsQuerySchema = z.object({
  locale: z.enum(ANNOUNCEMENT_LOCALES).default("fr"),
});

export const announcementIdParamSchema = z.object({
  id: z.string().min(1),
});
