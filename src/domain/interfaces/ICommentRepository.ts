import { Comment } from "@src/domain/entities/Comment.entity";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface CommentListItem {
  _id: string;
  author: {
    _id: string;
    username?: string;
    image?: { urls?: unknown };
  } | null;
  content: string;
  reference: string;
  referenceType: CommentReferenceType;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCommentSummary {
  _id: string;
  content: string;
  referenceType: CommentReferenceType;
  deleted: boolean;
  createdAt: Date;
}

export interface SoftDeleteCommentParams {
  deleted: boolean;
  adminId: UserId;
  reason?: string;
}

export interface ICommentRepository {
  save(comment: Comment): Promise<CommentId>;
  findById(id: CommentId): Promise<Comment | null>;
  update(comment: Comment): Promise<void>;
  delete(id: CommentId): Promise<void>;
  findByReference(
    referenceId: ReferenceId,
    referenceType: CommentReferenceType,
    authorId?: UserId
  ): Promise<CommentListItem[]>;
  findIdsByReferences(
    referenceIds: ReferenceId[],
    referenceType: CommentReferenceType
  ): Promise<CommentId[]>;
  deleteManyByIds(ids: CommentId[]): Promise<void>;
  findByAuthor(authorId: UserId, limit?: number): Promise<AdminCommentSummary[]>;
  softDelete(id: CommentId, params: SoftDeleteCommentParams): Promise<void>;
}
