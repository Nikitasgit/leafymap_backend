import CategoryType from "../models/CategoryType";
import PlaceCategory from "../models/PlaceCategory";
import UserCategory from "../models/UserCategory";
import ProductCategory from "../models/ProductCategory";
import EventCategory from "../models/EventCategory";
import {
  ICategoryRepository,
  CategoriesResponse,
} from "@/types/repositories/category.repository.types";

class CategoryRepository implements ICategoryRepository {
  async getAllCategories(): Promise<CategoriesResponse> {
    const categoryTypes = await CategoryType.find().sort({ name: 1 }).lean();
    const userCategories = await UserCategory.find()
      .populate("type")
      .sort({ name: 1 })
      .lean();
    const placeCategories = await PlaceCategory.find()
      .populate("types")
      .sort({ name: 1 })
      .lean();
    const productCategories = await ProductCategory.find()
      .populate("type")
      .sort({ name: 1 })
      .lean();
    const eventCategories = await EventCategory.find().sort({ name: 1 }).lean();

    return {
      categoryTypes: categoryTypes as any,
      userCategories: userCategories as any,
      placeCategories: placeCategories as any,
      productCategories: productCategories as any,
      eventCategories: eventCategories as any,
    };
  }
}

export default CategoryRepository;
