import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import {
  IGetPlacesInViewAction,
  GetPlacesInViewInput,
} from "@/actions/places";

class GetPlacesInViewController {
  constructor(private getPlacesInViewAction: IGetPlacesInViewAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { ne, sw, filters, limit } = req.query;

        if (!ne || !sw || typeof ne !== "string" || typeof sw !== "string") {
          APIResponse(res, null, "Missing required coordinates", 400);
          return;
        }

        const inputFilters: GetPlacesInViewInput = {
          ne,
          sw,
          filters: typeof filters === "string" ? filters : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        };

        const places = await this.getPlacesInViewAction.execute({
          filters: inputFilters,
        });

        APIResponse(res, places, "Places fetched successfully", 200);
      } catch (error) {
        logger.error("Error fetching places:", error);
        const message =
          error instanceof Error ? error.message : "Failed to fetch places";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetPlacesInViewController;
