import { CategoryItemReadModel } from "@src/domain/read-models/category.read-models";

export interface CategoriesResult {
  categoryTypes: CategoryItemReadModel[];
  userCategories: CategoryItemReadModel[];
  placeCategories: CategoryItemReadModel[];
  productCategories: CategoryItemReadModel[];
  eventCategories: CategoryItemReadModel[];
}

export interface ICategoryRepository {
  findAll(): Promise<CategoriesResult>;
}
