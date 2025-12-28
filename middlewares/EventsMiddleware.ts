import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import { IEventRepository } from "../repositories/events/IEventRepository";
import { IPlaceRepository } from "../repositories/places/IPlaceRepository";

class EventsMiddleware {
  constructor(
    private eventRepository: IEventRepository,
    private placeRepository: IPlaceRepository
  ) {}

  ownership(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const { eventId } = req.params;

        if (!eventId) {
          APIResponse(res, null, "Event ID is required", 400);
          return;
        }

        const event = await this.eventRepository.findById(eventId, ["place"]);
        if (!event) {
          APIResponse(res, null, "Event not found", 404);
          return;
        }

        const place = await this.placeRepository.findById(
          event.place.toString(),
          ["user"]
        );
        if (!place) {
          APIResponse(res, null, "Place associated with event not found", 404);
          return;
        }

        if (place.user.toString() !== decoded.id) {
          APIResponse(
            res,
            null,
            "You don't have permission to update this event",
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

export default EventsMiddleware;
