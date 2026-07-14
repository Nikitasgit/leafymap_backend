import CategoryType from "../models/CategoryType";
import PlaceCategory from "../models/PlaceCategory";
import UserCategory from "../models/UserCategory";
import ProductCategory from "../models/ProductCategory";
import EventCategory from "../models/EventCategory";
import {
  ICategoryRepository,
  CategoriesResponse,
} from "@/types/repositories/category.repository.types";
import { ICategoryType } from "@/types/models/categoryType";
import { IUserCategory } from "@/types/models/userCategory";
import { IPlaceCategory } from "@/types/models/placeCategory";
import { IProductCategory } from "@/types/models/productCategory";
import { IEventCategory } from "@/types/models/eventCategory";

class CategoryRepository implements ICategoryRepository {
  async getAllCategories(): Promise<CategoriesResponse> {
    const categoryTypes = await CategoryType.find()
      .sort({ name: 1 })
      .lean<ICategoryType[]>();
    const userCategories = await UserCategory.find()
      .populate("type")
      .sort({ name: 1 })
      .lean<IUserCategory[]>();
    const placeCategories = await PlaceCategory.find()
      .populate("types")
      .sort({ name: 1 })
      .lean<IPlaceCategory[]>();
    const productCategories = await ProductCategory.find()
      .populate("type")
      .sort({ name: 1 })
      .lean<IProductCategory[]>();
    const eventCategories = await EventCategory.find()
      .sort({ name: 1 })
      .lean<IEventCategory[]>();

    return {
      categoryTypes,
      userCategories,
      placeCategories,
      productCategories,
      eventCategories,
    };
  }
}

export default CategoryRepository;
