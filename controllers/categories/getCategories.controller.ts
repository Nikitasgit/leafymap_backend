import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetCategoriesAction } from "@/actions/categories";

class GetCategoriesController {
  constructor(private getCategoriesAction: IGetCategoriesAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const categories = await this.getCategoriesAction.execute();

        APIResponse(res, categories, "Categories fetched successfully", 200);
      } catch (error) {
        logger.error("Error getting categories:", error);
        const message =
          error instanceof Error ? error.message : "Failed to get categories";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetCategoriesController;
