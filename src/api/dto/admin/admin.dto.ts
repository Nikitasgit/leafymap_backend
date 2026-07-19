import { z } from "zod";

export const adminUserSearchSchema = z.object({
  email: z.string().trim().min(1).optional(),
});

export const adminBanUserSchema = z.object({
  reason: z.string().trim().min(1, "La raison est requise"),
  duration: z.number().int().positive().optional(),
});

export const adminSoftDeleteSchema = z.object({
  reason: z.string().trim().optional(),
});

export const adminResourceSchema = z.object({
  resource: z.enum(["events", "places", "images", "reviews", "comments"]),
  resourceId: z.string().min(1),
});
