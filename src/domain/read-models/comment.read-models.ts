import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { ImageReferenceReadModel } from "@src/domain/read-models/shared.read-models";

/**
 * Typed read models for Comment query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface CommentAuthorReadModel {
  id: string;
  username?: string;
  image?: ImageReferenceReadModel | string | null;
}

export interface CommentListItemReadModel {
  id: string;
  author: CommentAuthorReadModel | null;
  content: string;
  reference: string;
  referenceType: CommentReferenceType;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCommentSummaryReadModel {
  id: string;
  content: string;
  referenceType: CommentReferenceType;
  deleted: boolean;
  createdAt: Date;
}
