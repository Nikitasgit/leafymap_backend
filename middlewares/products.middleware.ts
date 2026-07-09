import { RequestHandler } from "express";
import { IProductRepository } from "@/types/repositories/product.repository.types";
import {
  createOwnershipMiddleware,
  getEntityOwnerId,
} from "./createOwnershipMiddleware";

class ProductsMiddleware {
  constructor(private productRepository: IProductRepository) {}

  ownership(): RequestHandler {
    return createOwnershipMiddleware({
      paramName: "productId",
      findById: (productId) =>
        this.productRepository.findById(productId, ["user"]),
      getOwnerId: getEntityOwnerId,
      notFoundMessage: "Product not found",
      forbiddenMessage: "You don't have permission to update this product",
      missingParamMessage: "Product ID is required",
      paramReqKey: "productId",
    });
  }
}

export default ProductsMiddleware;
