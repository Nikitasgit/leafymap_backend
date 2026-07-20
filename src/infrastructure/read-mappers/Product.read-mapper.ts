import {
  ProductDetailsReadModel,
  ProductListItemReadModel,
} from "@src/domain/read-models/product.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape the result into the typed read model expected by the API.
 */
export class ProductReadMapper {
  static toListItem(doc: unknown): ProductListItemReadModel {
    return normalizeLeanDocument<ProductListItemReadModel>(doc);
  }

  static toListItems(docs: unknown[]): ProductListItemReadModel[] {
    return docs.map((doc) => ProductReadMapper.toListItem(doc));
  }

  static toDetail(doc: unknown): ProductDetailsReadModel {
    return normalizeLeanDocument<ProductDetailsReadModel>(doc);
  }
}
