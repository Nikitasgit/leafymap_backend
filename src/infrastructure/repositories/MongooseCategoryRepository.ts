import {
  CategoriesResult,
  ICategoryRepository,
} from "@src/domain/interfaces/ICategoryRepository";
import CategoryTypeModel from "@src/infrastructure/persistence/schemas/CategoryType.schema";
import UserCategoryModel from "@src/infrastructure/persistence/schemas/UserCategory.schema";
import PlaceCategoryModel from "@src/infrastructure/persistence/schemas/PlaceCategory.schema";
import ProductCategoryModel from "@src/infrastructure/persistence/schemas/ProductCategory.schema";
import EventCategoryModel from "@src/infrastructure/persistence/schemas/EventCategory.schema";

class MongooseCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<CategoriesResult> {
    const [
      categoryTypes,
      userCategories,
      placeCategories,
      productCategories,
      eventCategories,
    ] = await Promise.all([
      CategoryTypeModel.find().sort({ name: 1 }).lean(),
      UserCategoryModel.find().populate("type").sort({ name: 1 }).lean(),
      PlaceCategoryModel.find().populate("types").sort({ name: 1 }).lean(),
      ProductCategoryModel.find().populate("type").sort({ name: 1 }).lean(),
      EventCategoryModel.find().sort({ name: 1 }).lean(),
    ]);

    return {
      categoryTypes: categoryTypes as Record<string, unknown>[],
      userCategories: userCategories as Record<string, unknown>[],
      placeCategories: placeCategories as Record<string, unknown>[],
      productCategories: productCategories as Record<string, unknown>[],
      eventCategories: eventCategories as Record<string, unknown>[],
    };
  }
}

export default MongooseCategoryRepository;
