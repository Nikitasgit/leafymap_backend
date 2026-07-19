import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const IMAGE_REFERENCE_TYPES = [
  "Place",
  "User",
  "Event",
  "Comment",
  "Review",
] as const;

export type ImageReferenceType = (typeof IMAGE_REFERENCE_TYPES)[number];

export const ImageReferenceType = {
  from(value: string): ImageReferenceType {
    if (!IMAGE_REFERENCE_TYPES.includes(value as ImageReferenceType)) {
      const message = `Invalid image reference type: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as ImageReferenceType;
  },
};
