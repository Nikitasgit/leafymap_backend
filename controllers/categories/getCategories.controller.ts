import { IGetCategoriesAction } from "@/actions/categories";
import { Controller, createController } from "@/utils/controllerFactory";

const GetCategoriesController = (
  getCategoriesAction: IGetCategoriesAction
): Controller =>
  createController({
    execute: () => getCategoriesAction.execute(),
    successMessage: "Categories fetched successfully",
  });

export default GetCategoriesController;
