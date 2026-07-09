import { getProductsQuerySchema } from "../../validations/product.validations";
import { IGetProductsAction } from "@/actions/products";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const GetProductsController = (getProductsAction: IGetProductsAction): Controller =>
  createController({
    execute: (req) =>
      getProductsAction.execute({
        filters: validateOrThrow(getProductsQuerySchema, req.query),
      }),
    successMessage: "Products retrieved successfully",
  });

export default GetProductsController;
