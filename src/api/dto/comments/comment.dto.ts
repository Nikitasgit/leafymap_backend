import { z } from "zod";
import { COMMENT_REFERENCE_TYPES } from "@src/domain/value-objects/CommentReferenceType.vo";
import { isValidObjectId } from "@/utils/objectId";

export const commentReferenceTypeEnum = z.enum(COMMENT_REFERENCE_TYPES);

const objectIdString = z
  .string()
  .min(1)
  .refine(isValidObjectId, { message: "Invalid ObjectId" });

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu du commentaire est requis")
    .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères"),
  reference: objectIdString,
  referenceType: commentReferenceTypeEnum,
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu du commentaire est requis")
    .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères"),
});

export const getCommentsQuerySchema = z.object({
  reference: objectIdString,
  referenceType: commentReferenceTypeEnum,
  author: objectIdString.optional(),
});
