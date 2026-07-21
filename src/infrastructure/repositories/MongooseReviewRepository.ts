import {
  IReviewRepository,
  SoftDeleteReviewParams,
} from "@src/domain/interfaces/IReviewRepository";
import { Review } from "@src/domain/entities/Review.entity";
import {
  AdminReviewSummaryReadModel,
  ReviewListItemReadModel,
} from "@src/domain/read-models/review.read-models";
import {
  ReferenceId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { ReviewMapper } from "@src/infrastructure/mappers/Review.mapper";
import { ReviewReadMapper } from "@src/infrastructure/read-mappers/Review.read-mapper";
import ReviewModel, {
  ReviewDocumentProps,
} from "@src/infrastructure/persistence/schemas/Review.schema";
import { Types } from "mongoose";

type ReviewDocumentWithId = ReviewDocumentProps & { _id: Types.ObjectId };

class MongooseReviewRepository implements IReviewRepository {
  async save(review: Review): Promise<ReviewId> {
    const document = await ReviewModel.create(
      ReviewMapper.toPersistence(review)
    );
    return ReviewId.from(document._id.toString());
  }

  async findById(id: ReviewId): Promise<Review | null> {
    const document = await ReviewModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return ReviewMapper.toDomain(document as ReviewDocumentWithId);
  }

  async findByAuthorAndReference(
    authorId: UserId,
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<Review | null> {
    const document = await ReviewModel.findOne({
      author: new Types.ObjectId(authorId),
      reference: new Types.ObjectId(referenceId),
      referenceType,
    }).lean();

    if (!document) {
      return null;
    }
    return ReviewMapper.toDomain(document as ReviewDocumentWithId);
  }

  async update(review: Review): Promise<void> {
    if (!review.id) {
      return;
    }
    await ReviewModel.updateOne(
      { _id: review.id },
      {
        rating: review.rating,
        comment: review.comment,
        updatedAt: review.updatedAt,
      }
    ).exec();
  }

  async delete(id: ReviewId): Promise<void> {
    await ReviewModel.findByIdAndDelete(id).exec();
  }

  async findByReference(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType,
    authorId?: UserId
  ): Promise<ReviewListItemReadModel[]> {
    const filter: Record<string, unknown> = {
      reference: new Types.ObjectId(referenceId),
      referenceType,
      deleted: false,
    };
    if (authorId) {
      filter.author = new Types.ObjectId(authorId);
    }

    const documents = await ReviewModel.find(filter)
      .select(
        "_id author rating comment reference referenceType certified createdAt updatedAt"
      )
      .populate({ path: "author", select: "_id username image.urls" })
      .sort({ createdAt: -1 })
      .lean();

    return ReviewReadMapper.toListItems(documents);
  }

  async findByAuthorWithPlaceReference(
    authorId: UserId
  ): Promise<ReviewListItemReadModel[]> {
    const documents = await ReviewModel.find({
      author: new Types.ObjectId(authorId),
      deleted: false,
    })
      .select(
        "_id author rating comment reference referenceType certified createdAt updatedAt"
      )
      .populate({ path: "author", select: "_id username image.urls" })
      .populate({
        path: "reference",
        select: "location user",
        populate: { path: "user", select: "username image.urls" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return ReviewReadMapper.toListItems(documents);
  }

  async findIdsByReferences(
    referenceIds: ReferenceId[],
    referenceType: ReviewReferenceType
  ): Promise<ReviewId[]> {
    if (referenceIds.length === 0) {
      return [];
    }

    const documents = await ReviewModel.find({
      reference: { $in: referenceIds.map((id) => new Types.ObjectId(id)) },
      referenceType,
    })
      .select("_id")
      .lean();

    return documents.map((doc) => ReviewId.from(doc._id.toString()));
  }

  async deleteManyByReferences(
    referenceIds: ReferenceId[],
    referenceType: ReviewReferenceType
  ): Promise<void> {
    if (referenceIds.length === 0) {
      return;
    }
    await ReviewModel.deleteMany({
      reference: { $in: referenceIds.map((id) => new Types.ObjectId(id)) },
      referenceType,
    }).exec();
  }

  async findRatingsByReference(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<number[]> {
    const documents = await ReviewModel.find({
      reference: new Types.ObjectId(referenceId),
      referenceType,
      deleted: false,
    })
      .select("rating")
      .lean();

    return documents.map((doc) => doc.rating ?? 0);
  }

  async findByAuthorAdmin(
    authorId: UserId,
    limit = 50
  ): Promise<AdminReviewSummaryReadModel[]> {
    const documents = await ReviewModel.find({
      author: new Types.ObjectId(authorId),
    })
      .select("_id rating comment referenceType deleted createdAt")
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return ReviewReadMapper.toAdminSummaries(documents);
  }

  async softDelete(
    id: ReviewId,
    params: SoftDeleteReviewParams
  ): Promise<void> {
    const update = params.deleted
      ? {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: new Types.ObjectId(params.adminId),
          deleteReason: params.reason,
        }
      : {
          deleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
          deleteReason: undefined,
        };

    await ReviewModel.updateOne({ _id: id }, update).exec();
  }
}

export default MongooseReviewRepository;
