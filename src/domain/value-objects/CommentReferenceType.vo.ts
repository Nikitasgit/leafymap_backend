import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const COMMENT_REFERENCE_TYPES = ["Review", "Image", "Comment"] as const;

export type CommentReferenceType = (typeof COMMENT_REFERENCE_TYPES)[number];

export const CommentReferenceType = {
  from(value: string): CommentReferenceType {
    if (!COMMENT_REFERENCE_TYPES.includes(value as CommentReferenceType)) {
      const message = `Invalid comment reference type: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as CommentReferenceType;
  },
};
