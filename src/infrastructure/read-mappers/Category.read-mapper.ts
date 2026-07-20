import { CategoryItemReadModel } from "@src/domain/read-models/category.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape the result into the typed read model expected by the API.
 */
export class CategoryReadMapper {
  static toItem(doc: unknown): CategoryItemReadModel {
    return normalizeLeanDocument<CategoryItemReadModel>(doc);
  }

  static toItems(docs: unknown[]): CategoryItemReadModel[] {
    return docs.map((doc) => CategoryReadMapper.toItem(doc));
  }
}
