import { asClass, AwilixContainer } from "awilix";
import CategoriesController from "@src/api/controllers/CategoriesController";
import GetCategoriesUseCase from "@src/application/usecases/categories/GetCategories.usecase";
import type { Cradle } from "@src/di/cradle";

export const registerCategoriesModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    getCategoriesUseCase: asClass(GetCategoriesUseCase).singleton(),
    categoriesController: asClass(CategoriesController).singleton(),
  });
};
