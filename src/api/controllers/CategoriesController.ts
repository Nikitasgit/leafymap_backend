import { RequestHandler } from "express";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import type GetCategoriesUseCase from "@src/application/usecases/categories/GetCategories.usecase";

class CategoriesController extends BaseHttpController {
  constructor(private readonly getCategoriesUseCase: GetCategoriesUseCase) {
    super();
  }

  list(): RequestHandler {
    return this.handler({
      execute: () => this.getCategoriesUseCase.execute(),
      successMessage: "Categories fetched successfully",
    });
  }
}

export default CategoriesController;
