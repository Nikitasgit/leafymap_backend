export interface CategoriesResult {
  categoryTypes: Record<string, unknown>[];
  userCategories: Record<string, unknown>[];
  placeCategories: Record<string, unknown>[];
  productCategories: Record<string, unknown>[];
  eventCategories: Record<string, unknown>[];
}

export interface ICategoryRepository {
  findAll(): Promise<CategoriesResult>;
}
