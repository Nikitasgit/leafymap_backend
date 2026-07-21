import {
  ProductDetailsReadModel,
  ProductListItemReadModel,
} from "@src/domain/read-models/product.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

export class ProductReadMapper {
  static toListItem(doc: unknown): ProductListItemReadModel {
    return ProductReadMapper.map(doc);
  }

  static toListItems(docs: unknown[]): ProductListItemReadModel[] {
    return docs.map((doc) => ProductReadMapper.toListItem(doc));
  }

  static toDetail(doc: unknown): ProductDetailsReadModel {
    return ProductReadMapper.map(doc);
  }

  private static map(doc: unknown): ProductListItemReadModel {
    const product = normalizeLeanDocument<ProductListItemReadModel>(doc);
    return {
      id: product.id,
      productCategory: product.productCategory,
      user: product.user,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
