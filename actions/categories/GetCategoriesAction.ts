import { ICategoryRepository } from "../../repositories/categories/ICategoryRepository";
import { ISubCategory } from "../../types/models/subCategory";
import { IPlaceCategory } from "../../types/models/placeCategory";

export interface IGetCategoriesAction {
  execute(): Promise<{
    creatorCategories: ISubCategory[];
    placeCategories: IPlaceCategory[];
  }>;
}

class GetCategoriesAction implements IGetCategoriesAction {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(): Promise<{
    creatorCategories: ISubCategory[];
    placeCategories: IPlaceCategory[];
  }> {
    return await this.categoryRepository.getAllCategories();
  }
}

export default GetCategoriesAction;
