export const REVIEW_REFERENCE_TYPES = ["Place", "Event"] as const;

export type ReviewReferenceType = (typeof REVIEW_REFERENCE_TYPES)[number];

export const ReviewReferenceType = {
  from(value: string): ReviewReferenceType {
    if (!REVIEW_REFERENCE_TYPES.includes(value as ReviewReferenceType)) {
      throw new Error(`Invalid review reference type: ${value}`);
    }
    return value as ReviewReferenceType;
  },
};
