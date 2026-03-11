import { BaseEntity } from "./common.dto";

// API Category types - for frontend consumption
export interface Category extends BaseEntity {
  name: string;
}

export interface UserCategory extends BaseEntity {
  name: string;
  userCategoryType: "creation" | "organization";
}

export interface PlaceCategory extends BaseEntity {
  name: string;
  description: string;
  types: PlaceType[];
}
type PlaceType = "art" | "craft" | "food";
