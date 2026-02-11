import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import {
  IGetProductsAction,
  GetProductsInput,
} from "@/actions/products";

class GetProductsController {
  constructor(private getProductsAction: IGetProductsAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { userId, productCategoryId, limit } = req.query;

        const filters: GetProductsInput = {};
        if (userId && typeof userId === "string") {
          filters.userId = userId;
        }
        if (productCategoryId && typeof productCategoryId === "string") {
          filters.productCategoryId = productCategoryId;
        }
        if (limit) {
          filters.limit = parseInt(limit as string);
        }

        const products = await this.getProductsAction.execute({ filters });

        APIResponse(res, products, "Products retrieved successfully", 200);
      } catch (error) {
        logger.error("Error fetching products:", error);
        const message =
          error instanceof Error ? error.message : "Failed to fetch products";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetProductsController;
