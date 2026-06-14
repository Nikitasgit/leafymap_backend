import { ICategoryRepository } from "@/types/repositories/category.repository.types";
import { ICategoryType } from "@/types/models/categoryType";
import { IUserCategory } from "@/types/models/userCategory";
import { IPlaceCategory } from "@/types/models/placeCategory";
import { IProductCategory } from "@/types/models/productCategory";
import { IEventCategory } from "@/types/models/eventCategory";

export interface IGetCategoriesAction {
  execute(): Promise<{
    categoryTypes: ICategoryType[];
    userCategories: IUserCategory[];
    placeCategories: IPlaceCategory[];
    productCategories: IProductCategory[];
    eventCategories: IEventCategory[];
  }>;
}

class GetCategoriesAction implements IGetCategoriesAction {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(): Promise<{
    categoryTypes: ICategoryType[];
    userCategories: IUserCategory[];
    placeCategories: IPlaceCategory[];
    productCategories: IProductCategory[];
    eventCategories: IEventCategory[];
  }> {
    return await this.categoryRepository.getAllCategories();
  }
}

export default GetCategoriesAction;
