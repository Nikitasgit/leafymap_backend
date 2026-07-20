import { RequestHandler } from "express";
import {
  getProductsQuerySchema,
  newProductSchema,
  updateProductSchema,
} from "@src/api/dto/products/product.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreateProductUseCase from "@src/application/usecases/products/CreateProduct.usecase";
import type DeleteProductUseCase from "@src/application/usecases/products/DeleteProduct.usecase";
import type GetProductByIdUseCase from "@src/application/usecases/products/GetProductById.usecase";
import type GetProductsUseCase from "@src/application/usecases/products/GetProducts.usecase";
import type UpdateProductUseCase from "@src/application/usecases/products/UpdateProduct.usecase";

class ProductsController extends BaseHttpController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const body = validateOrThrow(newProductSchema, req.body);
        return this.createProductUseCase.execute({
          productCategoryId: body.productCategory,
          userId: requireAuth(req).id,
        });
      },
      successMessage: "Product created successfully",
      successStatus: 201,
      mapResult: (result) => ({ _id: result.id }),
    });
  }

  list(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const filters = validateOrThrow(getProductsQuerySchema, req.query);
        return this.getProductsUseCase.execute(filters);
      },
      successMessage: "Products retrieved successfully",
    });
  }

  getById(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getProductByIdUseCase.execute({
          productId: requireObjectIdParam(req, "productId"),
        }),
      successMessage: "Product retrieved successfully",
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(updateProductSchema, req.body);
        await this.updateProductUseCase.execute({
          productId: requireObjectIdParam(req, "productId"),
          userId: requireAuth(req).id,
          productCategoryId: body.productCategory,
        });
      },
      successMessage: "Product updated successfully",
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.deleteProductUseCase.execute({
          productId: requireObjectIdParam(req, "productId"),
          userId: requireAuth(req).id,
        });
      },
      successMessage: "Product deleted successfully",
    });
  }
}

export default ProductsController;
