import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const FAVORITE_REFERENCE_TYPES = ["Place"] as const;

export type FavoriteReferenceType = (typeof FAVORITE_REFERENCE_TYPES)[number];

export const FavoriteReferenceType = {
  from(value: string): FavoriteReferenceType {
    if (!FAVORITE_REFERENCE_TYPES.includes(value as FavoriteReferenceType)) {
      const message = `Invalid favorite reference type: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as FavoriteReferenceType;
  },
};
