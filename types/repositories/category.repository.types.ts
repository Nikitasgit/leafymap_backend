import { ICategoryType } from "../models/categoryType";
import { IPlaceCategory } from "../models/placeCategory";
import { IUserCategory } from "../models/userCategory";
import { IProductCategory } from "../models/productCategory";
import { IEventCategory } from "../models/eventCategory";

export interface CategoriesResponse {
  categoryTypes: ICategoryType[];
  userCategories: IUserCategory[];
  placeCategories: IPlaceCategory[];
  productCategories: IProductCategory[];
  eventCategories: IEventCategory[];
}

export interface ICategoryRepository {
  getAllCategories(): Promise<CategoriesResponse>;
}
