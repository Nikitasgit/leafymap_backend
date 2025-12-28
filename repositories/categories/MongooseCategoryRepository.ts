import PlaceCategory from "../../models/PlaceCategory";
import UserCategory from "../../models/UserCategory";
import { ICategoryRepository, CategoriesResponse } from "./ICategoryRepository";

class MongooseCategoryRepository implements ICategoryRepository {
  async getAllCategories(): Promise<CategoriesResponse> {
    const userCategories = await UserCategory.find()
      .populate("category")
      .lean();
    const placeCategories = await PlaceCategory.find().lean();

    return {
      userCategories: userCategories as any,
      placeCategories: placeCategories as any,
    };
  }
}

export default MongooseCategoryRepository;
