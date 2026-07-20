import { Review } from "@src/domain/entities/Review.entity";
import {
  AdminReviewSummaryReadModel,
  ReviewListItemReadModel,
} from "@src/domain/read-models/review.read-models";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import {
  ReferenceId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface SoftDeleteReviewParams {
  deleted: boolean;
  adminId: UserId;
  reason?: string;
}

export interface IReviewRepository {
  save(review: Review): Promise<ReviewId>;
  findById(id: ReviewId): Promise<Review | null>;
  findByAuthorAndReference(
    authorId: UserId,
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<Review | null>;
  update(review: Review): Promise<void>;
  delete(id: ReviewId): Promise<void>;
  findByReference(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType,
    authorId?: UserId
  ): Promise<ReviewListItemReadModel[]>;
  findByAuthorWithPlaceReference(
    authorId: UserId
  ): Promise<ReviewListItemReadModel[]>;
  findIdsByReferences(
    referenceIds: ReferenceId[],
    referenceType: ReviewReferenceType
  ): Promise<ReviewId[]>;
  deleteManyByReferences(
    referenceIds: ReferenceId[],
    referenceType: ReviewReferenceType
  ): Promise<void>;
  findRatingsByReference(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<number[]>;
  findByAuthorAdmin(
    authorId: UserId,
    limit?: number
  ): Promise<AdminReviewSummaryReadModel[]>;
  softDelete(id: ReviewId, params: SoftDeleteReviewParams): Promise<void>;
}
