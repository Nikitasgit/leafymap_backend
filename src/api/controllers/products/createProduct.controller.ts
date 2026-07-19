import { newProductSchema } from "@src/api/dto/products/product.dto";
import type CreateProductUseCase from "@src/application/usecases/products/CreateProduct.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const CreateProductController = (
  createProductUseCase: CreateProductUseCase
): Controller =>
  createController({
    execute: (req) => {
      const body = validateOrThrow(newProductSchema, req.body);
      return createProductUseCase.execute({
        productCategoryId: body.productCategory,
        userId: requireAuth(req).id,
      });
    },
    successMessage: "Product created successfully",
    successStatus: 201,
    mapResult: (result) => ({ _id: result.id }),
  });

export default CreateProductController;
