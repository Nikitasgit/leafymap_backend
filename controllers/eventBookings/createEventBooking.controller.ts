import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { ICreateEventBookingAction } from "@/actions/eventBookings";
import { createEventBookingSchema } from "@/validations/eventBooking.validations";
import { validateData } from "@/utils/validation";

class CreateEventBookingController {
  constructor(private createEventBookingAction: ICreateEventBookingAction) {}

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

        const errors = validateData(createEventBookingSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        const booking = await this.createEventBookingAction.execute({
          eventId,
          userId: decoded.id,
          seats: req.body.seats,
        });

        APIResponse(res, booking, "Réservation créée avec succès", 201);
      } catch (error) {
        logger.error("Error creating event booking:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create event booking";
        const statusCode = message === "Event not found" ? 404 : 400;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default CreateEventBookingController;
