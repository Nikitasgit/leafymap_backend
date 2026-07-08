import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IGetMyEventBookingForEventAction } from "@/actions/eventBookings";

class GetMyEventBookingForEventController {
  constructor(
    private getMyEventBookingForEventAction: IGetMyEventBookingForEventAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const eventId = getParam(req.params, "eventId");

        if (!eventId) {
          APIResponse(res, null, "Event ID is required", 400);
          return;
        }

        const booking = await this.getMyEventBookingForEventAction.execute({
          eventId,
          userId: decoded.id,
        });

        APIResponse(res, booking, "Réservation récupérée avec succès", 200);
      } catch (error) {
        logger.error("Error getting my event booking for event:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get event booking";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetMyEventBookingForEventController;
