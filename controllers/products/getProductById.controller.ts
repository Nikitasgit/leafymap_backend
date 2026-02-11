import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetProductByIdAction } from "@/actions/products";
import { getParam } from "@/utils/request";

class GetProductByIdController {
  constructor(private getProductByIdAction: IGetProductByIdAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const productId = getParam(req.params, "productId");
        if (!productId) {
          APIResponse(res, null, "Product ID is required", 400);
          return;
        }

        const product = await this.getProductByIdAction.execute(productId);

        if (!product) {
          APIResponse(res, null, "Product not found", 404);
          return;
        }

        APIResponse(res, product, "Product retrieved successfully", 200);
      } catch (error) {
        logger.error("Error fetching product:", error);
        const message =
          error instanceof Error ? error.message : "Failed to fetch product";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetProductByIdController;
