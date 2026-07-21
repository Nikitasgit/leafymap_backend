import { CategoryItemReadModel } from "@src/domain/read-models/category.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

export class CategoryReadMapper {
  static toItem(doc: unknown): CategoryItemReadModel {
    const category = normalizeLeanDocument<CategoryItemReadModel>(doc);
    return {
      id: category.id,
      name: category.name,
      type: category.type,
      types: category.types,
    };
  }

  static toItems(docs: unknown[]): CategoryItemReadModel[] {
    return docs.map((doc) => CategoryReadMapper.toItem(doc));
  }
}
