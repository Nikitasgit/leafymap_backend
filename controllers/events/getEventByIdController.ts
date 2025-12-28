import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IGetEventByIdAction } from "../../actions/events/GetEventByIdAction";

class GetEventByIdController {
  constructor(private getEventByIdAction: IGetEventByIdAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { eventId } = req.params;

        if (!eventId) {
          APIResponse(res, null, "Event ID is required", 400);
          return;
        }

        const event = await this.getEventByIdAction.execute({ eventId });

        APIResponse(res, event, "Event fetched successfully", 200);
      } catch (error) {
        logger.error("Error fetching event:", error);
        const message =
          error instanceof Error ? error.message : "Failed to fetch event";
        const statusCode =
          error instanceof Error && error.message === "Event not found"
            ? 404
            : 500;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default GetEventByIdController;
