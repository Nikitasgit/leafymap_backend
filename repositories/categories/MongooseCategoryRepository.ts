import PlaceCategory from "../../models/PlaceCategory";
import SubCategory from "../../models/SubCategory";
import { ICategoryRepository, CategoriesResponse } from "./ICategoryRepository";

class MongooseCategoryRepository implements ICategoryRepository {
  async getAllCategories(): Promise<CategoriesResponse> {
    const creatorCategories = await SubCategory.find()
      .populate("category")
      .lean();
    const placeCategories = await PlaceCategory.find().lean();

    return {
      creatorCategories: creatorCategories as any,
      placeCategories: placeCategories as any,
    };
  }
}

export default MongooseCategoryRepository;
