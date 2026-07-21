import {
  AdminReviewSummaryReadModel,
  ReviewAuthorReadModel,
  ReviewListItemReadModel,
  ReviewPlaceReferenceReadModel,
} from "@src/domain/read-models/review.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape the (possibly unpopulated) author/reference fields into the typed
 * read model expected by the API.
 */
export class ReviewReadMapper {
  static toListItem(doc: unknown): ReviewListItemReadModel {
    const normalized = normalizeLeanDocument<ReviewListItemReadModel>(doc);

    return {
      id: normalized.id,
      author: ReviewReadMapper.mapAuthor(normalized.author),
      rating: normalized.rating,
      comment: normalized.comment,
      reference: ReviewReadMapper.mapReference(normalized.reference),
      referenceType: normalized.referenceType,
      certified: normalized.certified,
      createdAt: normalized.createdAt,
      updatedAt: normalized.updatedAt,
    };
  }

  static toListItems(docs: unknown[]): ReviewListItemReadModel[] {
    return docs.map((doc) => ReviewReadMapper.toListItem(doc));
  }

  static toAdminSummary(doc: unknown): AdminReviewSummaryReadModel {
    const normalized =
      normalizeLeanDocument<AdminReviewSummaryReadModel>(doc);

    return {
      id: normalized.id,
      rating: normalized.rating,
      comment: normalized.comment,
      referenceType: normalized.referenceType,
      deleted: normalized.deleted,
      createdAt: normalized.createdAt,
    };
  }

  static toAdminSummaries(docs: unknown[]): AdminReviewSummaryReadModel[] {
    return docs.map((doc) => ReviewReadMapper.toAdminSummary(doc));
  }

  private static mapAuthor(
    author: ReviewAuthorReadModel | string | null | undefined
  ): ReviewAuthorReadModel | null {
    if (!author || typeof author === "string") {
      return null;
    }
    if (!author.id) {
      return null;
    }
    return {
      id: author.id,
      username: author.username,
      image: author.image,
    };
  }

  private static mapReference(
    reference: string | (ReviewPlaceReferenceReadModel & { user?: unknown })
  ): string | ReviewPlaceReferenceReadModel {
    if (typeof reference === "string") {
      return reference;
    }
    if (!reference?.id) {
      throw new Error("Review reference read model is missing id");
    }

    const rawUser = reference.user as
      | {
          username?: string;
          image?: ReviewAuthorReadModel["image"];
        }
      | string
      | null
      | undefined;

    const user =
      rawUser && typeof rawUser === "object"
        ? { username: rawUser.username, image: rawUser.image }
        : null;

    return {
      id: reference.id,
      location: reference.location,
      user,
    };
  }
}
