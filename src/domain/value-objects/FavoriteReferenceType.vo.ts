export const FAVORITE_REFERENCE_TYPES = ["Place"] as const;

export type FavoriteReferenceType = (typeof FAVORITE_REFERENCE_TYPES)[number];

export const FavoriteReferenceType = {
  from(value: string): FavoriteReferenceType {
    if (!FAVORITE_REFERENCE_TYPES.includes(value as FavoriteReferenceType)) {
      throw new Error(`Invalid favorite reference type: ${value}`);
    }
    return value as FavoriteReferenceType;
  },
};
