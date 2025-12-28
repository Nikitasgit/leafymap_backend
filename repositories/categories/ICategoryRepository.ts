import { IPlaceCategory } from "../../types/models/placeCategory";
import { IUserCategory } from "../../types/models/userCategory";

export interface CategoriesResponse {
  userCategories: IUserCategory[];
  placeCategories: IPlaceCategory[];
}

export interface ICategoryRepository {
  getAllCategories(): Promise<CategoriesResponse>;
}
