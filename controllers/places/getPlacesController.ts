import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import {
  IGetPlacesAction,
  GetPlacesInput,
} from "../../actions/places/GetPlacesAction";

class GetPlacesController {
  constructor(private getPlacesAction: IGetPlacesAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { categoryId, limit } = req.query;

        const filters: GetPlacesInput = {};

        if (categoryId && typeof categoryId === "string") {
          filters.categoryId = categoryId;
        }
        if (limit) {
          filters.limit = parseInt(limit as string);
        }

        const places = await this.getPlacesAction.execute({ filters });

        let message = "Places retrieved successfully";
        if (categoryId) {
          message = "Places by category retrieved successfully";
        } else {
          message = "Latest places retrieved successfully";
        }

        APIResponse(res, places, message, 200);
      } catch (error) {
        logger.error("Error fetching places:", error);
        const message =
          error instanceof Error ? error.message : "Failed to fetch places";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetPlacesController;
