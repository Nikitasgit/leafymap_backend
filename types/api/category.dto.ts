import { BaseEntity } from "./common.dto";

// API Category types - for frontend consumption
export interface Category extends BaseEntity {
  name: string;
}

export interface SubCategory extends BaseEntity {
  name: string;
  categoryId: string;
}

export interface PlaceCategory extends BaseEntity {
  name: string;
  description: string;
  types: PlaceType[];
}
type PlaceType = "art" | "craft" | "food";

export interface CategoryWithSubCategories extends Category {
  subCategories: SubCategory[];
}
