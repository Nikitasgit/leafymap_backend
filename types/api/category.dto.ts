import { BaseEntity } from "./common.dto";

// API Category types - for frontend consumption
export interface CategoryType extends BaseEntity {
  name: string;
}

export interface UserCategory extends BaseEntity {
  name: string;
  type: string | Partial<CategoryType>;
}

export interface PlaceCategory extends BaseEntity {
  name: string;
  types: Array<string | Partial<CategoryType>>;
}

export interface ProductCategory extends BaseEntity {
  name: string;
  type: string | Partial<CategoryType>;
}

export interface EventCategory extends BaseEntity {
  name: string;
}
