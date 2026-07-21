import {
  ICategoryRepository,
} from "@src/domain/interfaces/ICategoryRepository";
import { CategoriesResultReadModel } from "@src/domain/read-models/category.read-models";
import { CategoryReadMapper } from "@src/infrastructure/read-mappers/Category.read-mapper";
import CategoryTypeModel from "@src/infrastructure/persistence/schemas/CategoryType.schema";
import UserCategoryModel from "@src/infrastructure/persistence/schemas/UserCategory.schema";
import PlaceCategoryModel from "@src/infrastructure/persistence/schemas/PlaceCategory.schema";
import ProductCategoryModel from "@src/infrastructure/persistence/schemas/ProductCategory.schema";
import EventCategoryModel from "@src/infrastructure/persistence/schemas/EventCategory.schema";

class MongooseCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<CategoriesResultReadModel> {
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
      categoryTypes: CategoryReadMapper.toItems(categoryTypes),
      userCategories: CategoryReadMapper.toItems(userCategories),
      placeCategories: CategoryReadMapper.toItems(placeCategories),
      productCategories: CategoryReadMapper.toItems(productCategories),
      eventCategories: CategoryReadMapper.toItems(eventCategories),
    };
  }
}

export default MongooseCategoryRepository;
