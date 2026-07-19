import type GetProductByIdUseCase from "@src/application/usecases/products/GetProductById.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetProductByIdController = (
  getProductByIdUseCase: GetProductByIdUseCase
): Controller =>
  createController({
    execute: (req) =>
      getProductByIdUseCase.execute({
        productId: requireObjectIdParam(req, "productId"),
      }),
    successMessage: "Product retrieved successfully",
  });

export default GetProductByIdController;
