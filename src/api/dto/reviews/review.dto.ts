import { z } from "zod";
import { REVIEW_REFERENCE_TYPES } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { isValidObjectId } from "@/utils/objectId";

export const reviewReferenceTypeEnum = z.enum(REVIEW_REFERENCE_TYPES);

const objectIdString = z
  .string()
  .min(1)
  .refine(isValidObjectId, { message: "Invalid ObjectId" });

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("La note doit être un nombre entier")
    .min(1, "La note doit être au moins 1")
    .max(5, "La note ne peut pas dépasser 5"),
  comment: z.string().optional(),
  reference: objectIdString,
  referenceType: reviewReferenceTypeEnum,
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
  reference: objectIdString,
  referenceType: reviewReferenceTypeEnum,
  author: objectIdString.optional(),
});
