import { z } from "zod";
import { FAVORITE_REFERENCE_TYPES } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import { isValidObjectId } from "@src/api/http/objectId";

export const favoriteReferenceTypeEnum = z.enum(FAVORITE_REFERENCE_TYPES);

const objectIdString = z
  .string()
  .min(1, "Reference ID is required")
  .refine(isValidObjectId, { message: "Invalid reference ID" });

export const createFavoriteSchema = z.object({
  referenceId: objectIdString,
  referenceType: favoriteReferenceTypeEnum,
});

export const deleteFavoriteSchema = z.object({
  referenceId: objectIdString,
  referenceType: favoriteReferenceTypeEnum,
});

export const getFavoritesByTypeQuerySchema = z.object({
  referenceType: favoriteReferenceTypeEnum,
});
