/**
 * Typed read models for Product query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface ProductCategoryTypeReadModel {
  id: string;
  name?: string;
}

export interface ProductCategoryReadModel {
  id: string;
  name?: string;
  type?: ProductCategoryTypeReadModel | string;
}

/** Shared fields for list and detail product reads. */
export interface ProductListItemReadModel {
  id: string;
  productCategory?: ProductCategoryReadModel | string;
  user?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

/** Detail view: currently identical in shape to the list view. */
export type ProductDetailsReadModel = ProductListItemReadModel;
