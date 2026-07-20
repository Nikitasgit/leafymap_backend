import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";

/**
 * Typed read models for Review query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface ReviewAuthorReadModel {
  id: string;
  username?: string;
  image?: { urls?: unknown };
}

export interface ReviewPlaceReferenceReadModel {
  id: string;
  location?: unknown;
  user?: {
    username?: string;
    image?: { urls?: unknown };
  } | null;
}

export interface ReviewListItemReadModel {
  id: string;
  author: ReviewAuthorReadModel | null;
  rating: number;
  comment?: string;
  reference: string | ReviewPlaceReferenceReadModel;
  referenceType: ReviewReferenceType;
  certified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminReviewSummaryReadModel {
  id: string;
  rating: number;
  comment?: string;
  referenceType: ReviewReferenceType;
  deleted: boolean;
  createdAt: Date;
}
