import { Response, NextFunction, RequestHandler, Request } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import {
  IGetPlacesInViewAction,
  GetPlacesInViewInput,
} from "@/actions/places";
import { MAX_IDS } from "@/actions/places/GetPlacesInView.action";

class GetPlacesInViewController {
  constructor(private getPlacesInViewAction: IGetPlacesInViewAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { ne, sw, ids, filters: clientFilters, limit } = req.query;

        const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;

        const idsParam =
          typeof ids === "string" && ids.trim()
            ? ids
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean)
            : undefined;

        if (idsParam && idsParam.length > MAX_IDS) {
          APIResponse(res, null, `Too many ids (max ${MAX_IDS})`, 400);
          return;
        }

        const inputFilters: GetPlacesInViewInput = {
          ids: idsParam,
          clientFilters:
            typeof clientFilters === "string" ? clientFilters : undefined,
          limit: parsedLimit,
        };

        // When fetching by ids, coordinates are not required.
        if (!idsParam?.length) {
          if (
            !ne ||
            !sw ||
            typeof ne !== "string" ||
            typeof sw !== "string"
          ) {
            APIResponse(res, null, "Missing required coordinates", 400);
            return;
          }

          try {
            inputFilters.ne = JSON.parse(ne);
            inputFilters.sw = JSON.parse(sw);
          } catch {
            APIResponse(res, null, "Invalid coordinate format", 400);
            return;
          }
        }

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
