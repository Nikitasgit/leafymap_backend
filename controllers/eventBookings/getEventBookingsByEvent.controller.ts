import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IGetEventBookingsByEventAction } from "@/actions/eventBookings";

class GetEventBookingsByEventController {
  constructor(
    private getEventBookingsByEventAction: IGetEventBookingsByEventAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const eventId = getParam(req.params, "eventId");

        if (!eventId) {
          APIResponse(res, null, "Event ID is required", 400);
          return;
        }

        const eventBookings = await this.getEventBookingsByEventAction.execute(
          { eventId }
        );

        APIResponse(
          res,
          eventBookings,
          "Réservations récupérées avec succès",
          200
        );
      } catch (error) {
        logger.error("Error getting event bookings by event:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get event bookings";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetEventBookingsByEventController;
