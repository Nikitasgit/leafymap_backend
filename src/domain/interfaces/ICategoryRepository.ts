import { CategoriesResultReadModel } from "@src/domain/read-models/category.read-models";

export interface ICategoryRepository {
  findAll(): Promise<CategoriesResultReadModel>;
}
