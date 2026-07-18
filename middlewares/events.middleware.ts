import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import { CustomRequest } from "@/types/custom";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";

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
        const eventIdParam = getParam(req.params, "eventId");

        if (!eventIdParam) {
          APIResponse(res, null, "Event ID is required", 400);
          return;
        }

        const event = await this.eventRepository.findById(
          EventId.from(eventIdParam)
        );
        if (!event || event.deleted) {
          APIResponse(res, null, "Event not found", 404);
          return;
        }

        if (!event.belongsTo(UserId.from(decoded.id))) {
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
