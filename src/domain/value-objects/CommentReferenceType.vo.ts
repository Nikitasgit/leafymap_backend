export const COMMENT_REFERENCE_TYPES = ["Review", "Image", "Comment"] as const;

export type CommentReferenceType = (typeof COMMENT_REFERENCE_TYPES)[number];

export const CommentReferenceType = {
  from(value: string): CommentReferenceType {
    if (!COMMENT_REFERENCE_TYPES.includes(value as CommentReferenceType)) {
      throw new Error(`Invalid comment reference type: ${value}`);
    }
    return value as CommentReferenceType;
  },
};
