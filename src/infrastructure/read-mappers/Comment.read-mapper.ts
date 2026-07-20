import {
  AdminCommentSummaryReadModel,
  CommentAuthorReadModel,
  CommentListItemReadModel,
} from "@src/domain/read-models/comment.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape the (possibly unpopulated) author field into the typed read model.
 */
export class CommentReadMapper {
  static toListItem(doc: unknown): CommentListItemReadModel {
    const normalized = normalizeLeanDocument<
      CommentListItemReadModel & { createdAt?: Date; updatedAt?: Date }
    >(doc);

    return {
      ...normalized,
      author: CommentReadMapper.mapAuthor(normalized.author),
      createdAt: normalized.createdAt ?? new Date(),
      updatedAt: normalized.updatedAt ?? new Date(),
    };
  }

  static toListItems(docs: unknown[]): CommentListItemReadModel[] {
    return docs.map((doc) => CommentReadMapper.toListItem(doc));
  }

  static toAdminSummary(doc: unknown): AdminCommentSummaryReadModel {
    const normalized = normalizeLeanDocument<
      AdminCommentSummaryReadModel & { createdAt?: Date }
    >(doc);

    return {
      ...normalized,
      deleted: normalized.deleted ?? false,
      createdAt: normalized.createdAt ?? new Date(),
    };
  }

  static toAdminSummaries(docs: unknown[]): AdminCommentSummaryReadModel[] {
    return docs.map((doc) => CommentReadMapper.toAdminSummary(doc));
  }

  private static mapAuthor(
    author: CommentAuthorReadModel | string | null | undefined
  ): CommentAuthorReadModel | null {
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
}
