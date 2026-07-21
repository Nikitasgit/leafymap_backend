/**
 * Typed read models for category query paths (category types, user/place/
 * product/event categories). Produced by infrastructure Read Mappers
 * (never raw Mongo docs).
 */

export interface CategoryItemReadModel {
  id: string;
  name?: string;
  type?: { id: string; name?: string } | string;
  types?: Array<{ id: string; name?: string } | string>;
}

export interface CategoriesResultReadModel {
  categoryTypes: CategoryItemReadModel[];
  userCategories: CategoryItemReadModel[];
  placeCategories: CategoryItemReadModel[];
  productCategories: CategoryItemReadModel[];
  eventCategories: CategoryItemReadModel[];
}
