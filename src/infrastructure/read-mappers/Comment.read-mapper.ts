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
    const normalized = normalizeLeanDocument<CommentListItemReadModel>(doc);

    return {
      id: normalized.id,
      author: CommentReadMapper.mapAuthor(normalized.author),
      content: normalized.content,
      reference: normalized.reference,
      referenceType: normalized.referenceType,
      createdAt: normalized.createdAt,
      updatedAt: normalized.updatedAt,
    };
  }

  static toListItems(docs: unknown[]): CommentListItemReadModel[] {
    return docs.map((doc) => CommentReadMapper.toListItem(doc));
  }

  static toAdminSummary(doc: unknown): AdminCommentSummaryReadModel {
    const normalized =
      normalizeLeanDocument<AdminCommentSummaryReadModel>(doc);

    return {
      id: normalized.id,
      content: normalized.content,
      referenceType: normalized.referenceType,
      deleted: normalized.deleted,
      createdAt: normalized.createdAt,
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
