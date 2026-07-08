import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { ICancelEventBookingAction } from "@/actions/eventBookings";

class CancelEventBookingController {
  constructor(private cancelEventBookingAction: ICancelEventBookingAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const bookingId = getParam(req.params, "bookingId");

        if (!bookingId) {
          APIResponse(res, null, "Booking ID is required", 400);
          return;
        }

        await this.cancelEventBookingAction.execute({
          bookingId,
          requesterId: decoded.id,
        });

        APIResponse(res, null, "Réservation annulée avec succès", 200);
      } catch (error) {
        logger.error("Error cancelling event booking:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to cancel event booking";
        const statusCode = message === "Réservation non trouvée" ? 404 : 400;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default CancelEventBookingController;
