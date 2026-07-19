import { updateProductSchema } from "@src/api/dto/products/product.dto";
import type UpdateProductUseCase from "@src/application/usecases/products/UpdateProduct.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const UpdateProductController = (
  updateProductUseCase: UpdateProductUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(updateProductSchema, req.body);
      await updateProductUseCase.execute({
        productId: requireObjectIdParam(req, "productId"),
        userId: requireAuth(req).id,
        productCategoryId: body.productCategory,
      });
    },
    successMessage: "Product updated successfully",
  });

export default UpdateProductController;
