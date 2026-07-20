import { Comment } from "@src/domain/entities/Comment.entity";
import {
  AdminCommentSummaryReadModel,
  CommentListItemReadModel,
} from "@src/domain/read-models/comment.read-models";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

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
  ): Promise<CommentListItemReadModel[]>;
  findIdsByReferences(
    referenceIds: ReferenceId[],
    referenceType: CommentReferenceType
  ): Promise<CommentId[]>;
  deleteManyByIds(ids: CommentId[]): Promise<void>;
  findByAuthor(
    authorId: UserId,
    limit?: number
  ): Promise<AdminCommentSummaryReadModel[]>;
  softDelete(id: CommentId, params: SoftDeleteCommentParams): Promise<void>;
}
