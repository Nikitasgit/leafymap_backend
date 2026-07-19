import GetCategoriesUseCase from "@src/application/usecases/categories/GetCategories.usecase";
import GetCategoriesController from "@src/api/controllers/categories/getCategories.controller";
import { mongooseCategoryRepository } from "@src/di/container";

const getCategoriesUseCase = new GetCategoriesUseCase(
  mongooseCategoryRepository
);

export const getCategories = GetCategoriesController(getCategoriesUseCase);
