import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IDeleteProductAction } from "@/actions/products";

class DeleteProductController {
  constructor(private deleteProductAction: IDeleteProductAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const productId = req.productId!;

        await this.deleteProductAction.execute({ productId });

        APIResponse(res, null, "Product deleted successfully", 200);
      } catch (error) {
        logger.error("Error deleting product:", error);
        const message =
          error instanceof Error ? error.message : "Failed to delete product";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default DeleteProductController;
