import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IUpdateEventBookingAction } from "@/actions/eventBookings";
import { updateEventBookingSchema } from "@/validations/eventBooking.validations";
import { validateData } from "@/utils/validation";

class UpdateEventBookingController {
  constructor(private updateEventBookingAction: IUpdateEventBookingAction) {}

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

        const errors = validateData(updateEventBookingSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        await this.updateEventBookingAction.execute({
          bookingId,
          requesterId: decoded.id,
          seats: req.body.seats,
        });

        APIResponse(res, { _id: bookingId }, "Réservation modifiée avec succès", 200);
      } catch (error) {
        logger.error("Error updating event booking:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update event booking";
        const statusCode = message === "Réservation non trouvée" ? 404 : 400;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default UpdateEventBookingController;
