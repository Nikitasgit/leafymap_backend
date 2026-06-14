import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import { CustomRequest } from "@/types/custom";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";

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
        const eventId = getParam(req.params, "eventId");

        if (!eventId) {
          APIResponse(res, null, "Event ID is required", 400);
          return;
        }

        const event = await this.eventRepository.findById(eventId, [
          "user",
          "place",
          "place.user",
        ]);
        if (!event) {
          APIResponse(res, null, "Event not found", 404);
          return;
        }

        const eventOwner =
          event.user && typeof event.user === "object" && "_id" in event.user
            ? event.user._id.toString()
            : event.user?.toString();

        if (eventOwner) {
          if (eventOwner !== decoded.id) {
            APIResponse(
              res,
              null,
              "You don't have permission to update this event",
              403
            );
            return;
          }

          next();
          return;
        }

        if (!event.place) {
          APIResponse(res, null, "Event owner not found", 404);
          return;
        }

        const placeId =
          typeof event.place === "object" && "_id" in event.place
            ? event.place._id.toString()
            : event.place.toString();

        const place = await this.placeRepository.findById(placeId, ["user"]);
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
