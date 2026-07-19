import type DeleteProductUseCase from "@src/application/usecases/products/DeleteProduct.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const DeleteProductController = (
  deleteProductUseCase: DeleteProductUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await deleteProductUseCase.execute({
        productId: requireObjectIdParam(req, "productId"),
        userId: requireAuth(req).id,
      });
    },
    successMessage: "Product deleted successfully",
  });

export default DeleteProductController;
