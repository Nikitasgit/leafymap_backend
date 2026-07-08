import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import { CustomRequest } from "@/types/custom";
import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";

const getOwnerId = (owner: unknown): string | undefined => {
  if (!owner) return undefined;
  if (typeof owner === "object" && "_id" in (owner as any)) {
    return (owner as any)._id.toString();
  }
  return owner.toString();
};

class EventBookingMiddleware {
  constructor(
    private eventBookingRepository: IEventBookingRepository,
    private eventRepository: IEventRepository
  ) {}

  ownership(): RequestHandler {
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

        const booking = await this.eventBookingRepository.findById(
          bookingId,
          ["_id", "user", "event"]
        );

        if (!booking) {
          APIResponse(res, null, "Réservation non trouvée", 404);
          return;
        }

        const bookingOwnerId = getOwnerId(booking.user);
        if (bookingOwnerId === decoded.id) {
          next();
          return;
        }

        const eventId = getOwnerId(booking.event) as string;
        const event = await this.eventRepository.findById(eventId, ["user"]);
        const eventOwnerId = event ? getOwnerId(event.user) : undefined;

        if (eventOwnerId === decoded.id) {
          next();
          return;
        }

        APIResponse(
          res,
          null,
          "You don't have permission to manage this booking",
          403
        );
      } catch (error) {
        APIResponse(res, null, "Failed to verify booking ownership", 500);
      }
    };
  }

  eventOwnership(): RequestHandler {
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

        const event = await this.eventRepository.findById(eventId, ["user"]);

        if (!event) {
          APIResponse(res, null, "Event not found", 404);
          return;
        }

        const eventOwnerId = getOwnerId(event.user);

        if (eventOwnerId !== decoded.id) {
          APIResponse(
            res,
            null,
            "You don't have permission to view these bookings",
            403
          );
          return;
        }

        next();
      } catch (error) {
        APIResponse(res, null, "Failed to verify event ownership", 500);
      }
    };
  }
}

export default EventBookingMiddleware;
