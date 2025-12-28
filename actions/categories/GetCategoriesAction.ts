import { ICategoryRepository } from "../../repositories/categories/ICategoryRepository";
import { IUserCategory } from "../../types/models/userCategory";
import { IPlaceCategory } from "../../types/models/placeCategory";

export interface IGetCategoriesAction {
  execute(): Promise<{
    userCategories: IUserCategory[];
    placeCategories: IPlaceCategory[];
  }>;
}

class GetCategoriesAction implements IGetCategoriesAction {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(): Promise<{
    userCategories: IUserCategory[];
    placeCategories: IPlaceCategory[];
  }> {
    return await this.categoryRepository.getAllCategories();
  }
}

export default GetCategoriesAction;
