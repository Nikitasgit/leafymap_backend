import { Review } from "@src/domain/entities/Review.entity";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import {
  ReferenceId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface ReviewAuthor {
  _id: string;
  username?: string;
  image?: { urls?: unknown };
}

export interface ReviewPlaceReference {
  _id: string;
  location?: unknown;
  user?: {
    username?: string;
    image?: { urls?: unknown };
  } | null;
}

export interface ReviewListItem {
  _id: string;
  author: ReviewAuthor | null;
  rating: number;
  comment?: string;
  reference: string | ReviewPlaceReference;
  referenceType: ReviewReferenceType;
  certified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminReviewSummary {
  _id: string;
  rating: number;
  comment?: string;
  referenceType: ReviewReferenceType;
  deleted: boolean;
  createdAt: Date;
}

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
  ): Promise<ReviewListItem[]>;
  findByAuthorWithPlaceReference(authorId: UserId): Promise<ReviewListItem[]>;
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
  ): Promise<AdminReviewSummary[]>;
  softDelete(id: ReviewId, params: SoftDeleteReviewParams): Promise<void>;
}
