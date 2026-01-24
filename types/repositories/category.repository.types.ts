import { IPlaceCategory } from "../models/placeCategory";
import { IUserCategory } from "../models/userCategory";

export interface CategoriesResponse {
  userCategories: IUserCategory[];
  placeCategories: IPlaceCategory[];
}

export interface ICategoryRepository {
  getAllCategories(): Promise<CategoriesResponse>;
}
