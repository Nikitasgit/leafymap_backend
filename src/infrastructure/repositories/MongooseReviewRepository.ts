import {
  AdminReviewSummary,
  IReviewRepository,
  ReviewListItem,
  ReviewPlaceReference,
  SoftDeleteReviewParams,
} from "@src/domain/interfaces/IReviewRepository";
import { Review } from "@src/domain/entities/Review.entity";
import {
  ReferenceId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { ReviewMapper } from "@src/infrastructure/mappers/Review.mapper";
import ReviewModel, {
  ReviewDocumentProps,
} from "@src/infrastructure/persistence/schemas/Review.schema";
import { Types } from "mongoose";

type ReviewDocumentWithId = ReviewDocumentProps & { _id: Types.ObjectId };

type PopulatedAuthor = {
  _id?: Types.ObjectId;
  username?: string;
  image?: { urls?: unknown };
};

type PopulatedPlaceUser = {
  username?: string;
  image?: { urls?: unknown };
};

type PopulatedPlaceReference = {
  _id?: Types.ObjectId;
  location?: unknown;
  user?: PopulatedPlaceUser | Types.ObjectId | null;
};

type ReviewListDocument = {
  _id: Types.ObjectId;
  author: PopulatedAuthor | Types.ObjectId | null;
  rating: number;
  comment?: string;
  reference: Types.ObjectId | PopulatedPlaceReference;
  referenceType: ReviewReferenceType;
  certified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

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
  ): Promise<ReviewListItem[]> {
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

    return (documents as ReviewListDocument[]).map((doc) =>
      this.mapListItem(doc, false)
    );
  }

  async findByAuthorWithPlaceReference(
    authorId: UserId
  ): Promise<ReviewListItem[]> {
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

    return (documents as ReviewListDocument[]).map((doc) =>
      this.mapListItem(doc, true)
    );
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
  ): Promise<AdminReviewSummary[]> {
    const documents = await ReviewModel.find({
      author: new Types.ObjectId(authorId),
    })
      .select("_id rating comment referenceType deleted createdAt")
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return documents.map((doc) => ({
      _id: doc._id.toString(),
      rating: doc.rating,
      comment: doc.comment,
      referenceType: doc.referenceType,
      deleted: doc.deleted ?? false,
      createdAt: doc.createdAt ?? new Date(),
    }));
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

  private mapListItem(
    doc: ReviewListDocument,
    withPlaceReference: boolean
  ): ReviewListItem {
    return {
      _id: doc._id.toString(),
      author: this.mapAuthor(doc.author),
      rating: doc.rating,
      comment: doc.comment,
      reference: withPlaceReference
        ? this.mapPlaceReference(doc.reference)
        : this.mapReferenceId(doc.reference),
      referenceType: doc.referenceType,
      certified: doc.certified ?? false,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    };
  }

  private mapAuthor(
    author: PopulatedAuthor | Types.ObjectId | null
  ): ReviewListItem["author"] {
    if (!author || author instanceof Types.ObjectId) {
      return null;
    }
    if (!author._id) {
      return null;
    }
    return {
      _id: author._id.toString(),
      username: author.username,
      image: author.image,
    };
  }

  private mapReferenceId(
    reference: Types.ObjectId | PopulatedPlaceReference
  ): string {
    if (reference instanceof Types.ObjectId) {
      return reference.toString();
    }
    if (reference._id) {
      return reference._id.toString();
    }
    return String(reference);
  }

  private mapPlaceReference(
    reference: Types.ObjectId | PopulatedPlaceReference
  ): string | ReviewPlaceReference {
    if (reference instanceof Types.ObjectId) {
      return reference.toString();
    }
    if (!reference._id) {
      return this.mapReferenceId(reference);
    }

    const user =
      reference.user && !(reference.user instanceof Types.ObjectId)
        ? {
            username: reference.user.username,
            image: reference.user.image,
          }
        : null;

    return {
      _id: reference._id.toString(),
      location: reference.location,
      user,
    };
  }
}

export default MongooseReviewRepository;
