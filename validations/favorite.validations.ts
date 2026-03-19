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

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export type DeleteFavoriteInput = z.infer<typeof deleteFavoriteSchema>;
export type FindFavoritesByTypeQuery = z.infer<
  typeof findFavoritesByTypeQuerySchema
>;
