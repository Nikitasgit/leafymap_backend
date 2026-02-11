import { IPlaceCategory } from "../models/placeCategory";
import { IUserCategory } from "../models/userCategory";
import { IProductCategory } from "../models/productCategory";

export interface CategoriesResponse {
  userCategories: IUserCategory[];
  placeCategories: IPlaceCategory[];
  productCategories: IProductCategory[];
}

export interface ICategoryRepository {
  getAllCategories(): Promise<CategoriesResponse>;
}
