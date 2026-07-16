import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { ValidationError } from "@src/shared/errors";

const MIN_CONTENT_LENGTH = 1;
const MAX_CONTENT_LENGTH = 1000;

export interface CreateCommentParams {
  authorId: UserId;
  content: string;
  referenceId: ReferenceId;
  referenceType: CommentReferenceType;
}

export interface ReconstituteCommentParams extends CreateCommentParams {
  id: CommentId;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: UserId;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment {
  private constructor(
    public readonly id: CommentId | null,
    public readonly authorId: UserId,
    public readonly content: string,
    public readonly referenceId: ReferenceId,
    public readonly referenceType: CommentReferenceType,
    public readonly deleted: boolean,
    public readonly deletedAt: Date | undefined,
    public readonly deletedBy: UserId | undefined,
    public readonly deleteReason: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateCommentParams): Comment {
    const content = Comment.assertContent(params.content);
    const now = new Date();
    return new Comment(
      null,
      params.authorId,
      content,
      params.referenceId,
      params.referenceType,
      false,
      undefined,
      undefined,
      undefined,
      now,
      now
    );
  }

  static reconstitute(params: ReconstituteCommentParams): Comment {
    return new Comment(
      params.id,
      params.authorId,
      params.content,
      params.referenceId,
      params.referenceType,
      params.deleted,
      params.deletedAt,
      params.deletedBy,
      params.deleteReason,
      params.createdAt,
      params.updatedAt
    );
  }

  updateContent(content: string): Comment {
    const nextContent = Comment.assertContent(content);
    return new Comment(
      this.id,
      this.authorId,
      nextContent,
      this.referenceId,
      this.referenceType,
      this.deleted,
      this.deletedAt,
      this.deletedBy,
      this.deleteReason,
      this.createdAt,
      new Date()
    );
  }

  belongsTo(userId: UserId): boolean {
    return this.authorId === userId;
  }

  private static assertContent(content: string): string {
    const trimmed = content.trim();
    if (
      trimmed.length < MIN_CONTENT_LENGTH ||
      trimmed.length > MAX_CONTENT_LENGTH
    ) {
      throw new ValidationError({
        content: "Comment content must be between 1 and 1000 characters",
      });
    }
    return trimmed;
  }
}
