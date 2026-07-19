import type GetCategoriesUseCase from "@src/application/usecases/categories/GetCategories.usecase";
import { Controller, createController } from "@src/api/http/controllerFactory";

const GetCategoriesController = (
  getCategoriesUseCase: GetCategoriesUseCase
): Controller =>
  createController({
    execute: () => getCategoriesUseCase.execute(),
    successMessage: "Categories fetched successfully",
  });

export default GetCategoriesController;
