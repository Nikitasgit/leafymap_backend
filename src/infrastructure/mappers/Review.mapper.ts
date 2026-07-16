import { Review } from "@src/domain/entities/Review.entity";
import {
  ReferenceId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { ReviewDocumentProps } from "@src/infrastructure/persistence/schemas/Review.schema";
import { Types } from "mongoose";

export class ReviewMapper {
  static toDomain(
    doc: ReviewDocumentProps & { _id: Types.ObjectId }
  ): Review {
    return Review.reconstitute({
      id: ReviewId.from(doc._id.toString()),
      authorId: UserId.from(doc.author.toString()),
      rating: doc.rating,
      comment: doc.comment,
      referenceId: ReferenceId.from(doc.reference.toString()),
      referenceType: ReviewReferenceType.from(doc.referenceType),
      certified: doc.certified ?? false,
      deleted: doc.deleted ?? false,
      deletedAt: doc.deletedAt,
      deletedBy: doc.deletedBy
        ? UserId.from(doc.deletedBy.toString())
        : undefined,
      deleteReason: doc.deleteReason,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    review: Review
  ): Omit<ReviewDocumentProps, "_id"> {
    return {
      author: new Types.ObjectId(review.authorId),
      rating: review.rating,
      comment: review.comment,
      reference: new Types.ObjectId(review.referenceId),
      referenceType: review.referenceType,
      certified: review.certified,
      deleted: review.deleted,
      deletedAt: review.deletedAt,
      deletedBy: review.deletedBy
        ? new Types.ObjectId(review.deletedBy)
        : undefined,
      deleteReason: review.deleteReason,
    };
  }
}
