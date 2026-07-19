import {
  CategoriesResult,
  ICategoryRepository,
} from "@src/domain/interfaces/ICategoryRepository";

class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(): Promise<CategoriesResult> {
    return this.categoryRepository.findAll();
  }
}

export default GetCategoriesUseCase;
