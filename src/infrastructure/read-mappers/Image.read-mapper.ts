import { ImageAdminSummaryReadModel } from "@src/domain/read-models/image.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string.
 */
export class ImageReadMapper {
  static toAdminSummary(doc: unknown): ImageAdminSummaryReadModel {
    return normalizeLeanDocument<ImageAdminSummaryReadModel>(doc);
  }

  static toAdminSummaries(docs: unknown[]): ImageAdminSummaryReadModel[] {
    return docs.map((doc) => ImageReadMapper.toAdminSummary(doc));
  }
}
