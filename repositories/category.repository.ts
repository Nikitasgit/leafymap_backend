import PlaceCategory from "../models/PlaceCategory";
import UserCategory from "../models/UserCategory";
import ProductCategory from "../models/ProductCategory";
import {
  ICategoryRepository,
  CategoriesResponse,
} from "@/types/repositories/category.repository.types";

class CategoryRepository implements ICategoryRepository {
  async getAllCategories(): Promise<CategoriesResponse> {
    const userCategories = await UserCategory.find()
      .populate("category")
      .lean();
    const placeCategories = await PlaceCategory.find().lean();
    const productCategories = await ProductCategory.find()
      .populate("category")
      .sort({ "category.name": 1, name: 1 })
      .lean();

    return {
      userCategories: userCategories as any,
      placeCategories: placeCategories as any,
      productCategories: productCategories as any,
    };
  }
}

export default CategoryRepository;
