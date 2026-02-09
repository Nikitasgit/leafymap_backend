import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IGetPlaceByIdAction } from "@/actions/places";

class GetPlaceByIdController {
  constructor(private getPlaceByIdAction: IGetPlaceByIdAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const placeId = getParam(req.params, "placeId");
        const { scheduleWithEvents } = req.query;

        if (!placeId) {
          APIResponse(res, null, "Place ID is required", 400);
          return;
        }

        const place = await this.getPlaceByIdAction.execute({
          placeId,
          scheduleWithEvents: scheduleWithEvents === "true",
        });

        APIResponse(res, place, "Place fetched successfully", 200);
      } catch (error) {
        logger.error("Error fetching place:", error);
        const message = error instanceof Error ? error.message : "Server error";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetPlaceByIdController;
