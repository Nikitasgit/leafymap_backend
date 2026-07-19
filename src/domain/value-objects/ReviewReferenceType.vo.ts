import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const REVIEW_REFERENCE_TYPES = ["Place", "Event"] as const;

export type ReviewReferenceType = (typeof REVIEW_REFERENCE_TYPES)[number];

export const ReviewReferenceType = {
  from(value: string): ReviewReferenceType {
    if (!REVIEW_REFERENCE_TYPES.includes(value as ReviewReferenceType)) {
      const message = `Invalid review reference type: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as ReviewReferenceType;
  },
};
