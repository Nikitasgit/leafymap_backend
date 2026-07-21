import { ICategoryRepository } from "@src/domain/interfaces/ICategoryRepository";
import { CategoriesResultReadModel } from "@src/domain/read-models/category.read-models";

class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(): Promise<CategoriesResultReadModel> {
    return this.categoryRepository.findAll();
  }
}

export default GetCategoriesUseCase;
