import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { newProductSchema } from "../../validations/product.validations";
import { ICreateProductAction } from "@/actions/products";
import { validateData } from "@/utils/validation";

class CreateProductController {
  constructor(private createProductAction: ICreateProductAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;

        const errors = validateData(newProductSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        const product = await this.createProductAction.execute({
          productData: req.body,
          userId: decoded.id,
        });

        APIResponse(res, product, "Product created successfully", 201);
      } catch (error) {
        logger.error("Error creating product:", error);
        const err = error as Error & { code?: string };
        const message =
          err instanceof Error ? err.message : "Failed to create product";
        const status = err.code === "MAX_PRODUCTS_REACHED" ? 400 : 500;
        APIResponse(res, null, message, status);
      }
    };
  }
}

export default CreateProductController;
