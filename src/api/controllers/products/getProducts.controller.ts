import { getProductsQuerySchema } from "@src/api/dto/products/product.dto";
import type GetProductsUseCase from "@src/application/usecases/products/GetProducts.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetProductsController = (
  getProductsUseCase: GetProductsUseCase
): Controller =>
  createController({
    execute: (req) => {
      const filters = validateOrThrow(getProductsQuerySchema, req.query);
      return getProductsUseCase.execute(filters);
    },
    successMessage: "Products retrieved successfully",
  });

export default GetProductsController;
