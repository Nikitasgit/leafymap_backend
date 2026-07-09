import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import { CustomRequest } from "@/types/custom";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { isEventOwner } from "@/utils/mongoose";

class EventsMiddleware {
  constructor(private eventRepository: IEventRepository) {}

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

        if (!isEventOwner(event, decoded.id)) {
          APIResponse(
            res,
            null,
            "You don't have permission to update this event",
            403
          );
          return;
        }

        next();
      } catch {
        APIResponse(res, null, "Failed to verify event ownership", 500);
      }
    };
  }
}

export default EventsMiddleware;
