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
        const { name, categoryId, limit } = req.query;

        // Validate name length if provided
        if (name && typeof name === "string" && name.length < 3) {
          APIResponse(
            res,
            [],
            "Search query must be at least 3 characters",
            200
          );
          return;
        }

        const filters: GetPlacesInput = {};

        if (name && typeof name === "string") {
          filters.name = name;
        }
        if (categoryId && typeof categoryId === "string") {
          filters.categoryId = categoryId;
        }
        if (limit) {
          filters.limit = parseInt(limit as string);
        }

        const places = await this.getPlacesAction.execute({ filters });

        let message = "Places retrieved successfully";
        if (name) {
          message = "Places searched successfully";
        } else if (categoryId) {
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
