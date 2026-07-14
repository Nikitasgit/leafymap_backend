import { z } from "zod";

export const favoriteReferenceTypeEnum = z.enum(["Place"]);

export const createFavoriteSchema = z.object({
  referenceId: z.string().min(1, "Reference ID is required"),
  referenceType: favoriteReferenceTypeEnum,
});

export const deleteFavoriteSchema = z.object({
  referenceId: z.string().min(1, "Reference ID is required"),
  referenceType: favoriteReferenceTypeEnum,
});

export const findFavoritesByTypeQuerySchema = z.object({
  referenceType: favoriteReferenceTypeEnum,
});
