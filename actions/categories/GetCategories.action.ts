import { ICategoryRepository } from "@/types/repositories/category.repository.types";
import { IUserCategory } from "@/types/models/userCategory";
import { IPlaceCategory } from "@/types/models/placeCategory";
import { IProductCategory } from "@/types/models/productCategory";

export interface IGetCategoriesAction {
  execute(): Promise<{
    userCategories: IUserCategory[];
    placeCategories: IPlaceCategory[];
    productCategories: IProductCategory[];
  }>;
}

class GetCategoriesAction implements IGetCategoriesAction {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(): Promise<{
    userCategories: IUserCategory[];
    placeCategories: IPlaceCategory[];
    productCategories: IProductCategory[];
  }> {
    return await this.categoryRepository.getAllCategories();
  }
}

export default GetCategoriesAction;
