import { IPlaceCategory } from "../../types/models/placeCategory";
import { ISubCategory } from "../../types/models/subCategory";

export interface CategoriesResponse {
  creatorCategories: ISubCategory[];
  placeCategories: IPlaceCategory[];
}

export interface ICategoryRepository {
  getAllCategories(): Promise<CategoriesResponse>;
}

