import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import { CustomRequest } from "@/types/custom";
import { IProductRepository } from "@/types/repositories/product.repository.types";

class ProductsMiddleware {
  constructor(private productRepository: IProductRepository) {}

  ownership(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const productId = getParam(req.params, "productId");

        if (!productId) {
          APIResponse(res, null, "Product ID is required", 400);
          return;
        }

        const product = await this.productRepository.findById(productId, [
          "user",
        ]);
        if (!product) {
          APIResponse(res, null, "Product not found", 404);
          return;
        }

        const productUserId =
          typeof product.user === "object" && product.user && "toString" in product.user
            ? (product.user as { toString(): string }).toString()
            : String(product.user);
        if (productUserId !== decoded.id) {
          APIResponse(
            res,
            null,
            "You don't have permission to update this product",
            403
          );
          return;
        }

        req.productId = productId;
        next();
      } catch (error) {
        APIResponse(res, null, "Failed to verify product ownership", 500);
      }
    };
  }
}

export default ProductsMiddleware;
