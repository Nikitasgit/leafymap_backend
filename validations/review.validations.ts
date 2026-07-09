import { z } from "zod";
import { ReviewReferenceType } from "@/types/models/review";

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("La note doit être un nombre entier")
    .min(1, "La note doit être au moins 1")
    .max(5, "La note ne peut pas dépasser 5"),
  comment: z.string().optional(),
  reference: z.string().min(1, "La référence est requise"),
  referenceType: z.enum(["Place", "Event"], {
    errorMap: () => ({
      message: "Le type de référence doit être Place ou Event",
    }),
  }) as z.ZodType<ReviewReferenceType>,
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int("La note doit être un nombre entier")
    .min(1, "La note doit être au moins 1")
    .max(5, "La note ne peut pas dépasser 5")
    .optional(),
  comment: z.string().optional(),
});

export const getReviewsQuerySchema = z.object({
  reference: z.string().min(1, "Le paramètre 'reference' est requis"),
  referenceType: z.enum(["Place", "Event"], {
    errorMap: () => ({
      message: "Le type de référence doit être Place ou Event",
    }),
  }) as z.ZodType<ReviewReferenceType>,
  author: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
