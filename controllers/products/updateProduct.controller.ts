import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { updateProductSchema } from "../../validations/product.validations";
import { IUpdateProductAction } from "@/actions/products";
import { validateData } from "@/utils/validation";

class UpdateProductController {
  constructor(private updateProductAction: IUpdateProductAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const productId = req.productId!;

        const errors = validateData(updateProductSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        await this.updateProductAction.execute({
          productId,
          updateData: req.body,
        });

        APIResponse(res, null, "Product updated successfully", 200);
      } catch (error) {
        logger.error("Error updating product:", error);
        const message =
          error instanceof Error ? error.message : "Failed to update product";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default UpdateProductController;
