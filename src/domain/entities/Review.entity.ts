import {
  ReferenceId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { ValidationError } from "@src/shared/errors";

const MIN_RATING = 1;
const MAX_RATING = 5;
const MAX_COMMENT_LENGTH = 2000;

export interface CreateReviewParams {
  authorId: UserId;
  rating: number;
  comment?: string;
  referenceId: ReferenceId;
  referenceType: ReviewReferenceType;
}

export interface ReconstituteReviewParams extends CreateReviewParams {
  id: ReviewId;
  certified: boolean;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: UserId;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Review {
  private constructor(
    public readonly id: ReviewId | null,
    public readonly authorId: UserId,
    public readonly rating: number,
    public readonly comment: string | undefined,
    public readonly referenceId: ReferenceId,
    public readonly referenceType: ReviewReferenceType,
    public readonly certified: boolean,
    public readonly deleted: boolean,
    public readonly deletedAt: Date | undefined,
    public readonly deletedBy: UserId | undefined,
    public readonly deleteReason: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateReviewParams): Review {
    const rating = Review.assertRating(params.rating);
    const comment = Review.assertComment(params.comment);
    const now = new Date();
    return new Review(
      null,
      params.authorId,
      rating,
      comment,
      params.referenceId,
      params.referenceType,
      false,
      false,
      undefined,
      undefined,
      undefined,
      now,
      now
    );
  }

  static reconstitute(params: ReconstituteReviewParams): Review {
    return new Review(
      params.id,
      params.authorId,
      params.rating,
      params.comment,
      params.referenceId,
      params.referenceType,
      params.certified,
      params.deleted,
      params.deletedAt,
      params.deletedBy,
      params.deleteReason,
      params.createdAt,
      params.updatedAt
    );
  }

  updateRatingAndComment(params: {
    rating?: number;
    comment?: string;
  }): Review {
    const rating =
      params.rating !== undefined
        ? Review.assertRating(params.rating)
        : this.rating;
    const comment =
      params.comment !== undefined
        ? Review.assertComment(params.comment)
        : this.comment;

    return new Review(
      this.id,
      this.authorId,
      rating,
      comment,
      this.referenceId,
      this.referenceType,
      this.certified,
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

  private static assertRating(rating: number): number {
    if (
      !Number.isInteger(rating) ||
      rating < MIN_RATING ||
      rating > MAX_RATING
    ) {
      throw new ValidationError({
        rating: "Rating must be an integer between 1 and 5",
      });
    }
    return rating;
  }

  private static assertComment(
    comment: string | undefined
  ): string | undefined {
    if (comment === undefined) {
      return undefined;
    }
    const trimmed = comment.trim();
    if (trimmed.length === 0) {
      return undefined;
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      throw new ValidationError({
        comment: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`,
      });
    }
    return trimmed;
  }
}
