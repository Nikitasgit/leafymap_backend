import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { ICreateEventAction } from "@/actions/events";
import { newEventSchema } from "../../validations/event.validations";
import { validateData } from "@/utils/validation";

class CreateEventController {
  constructor(private createEventAction: ICreateEventAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        if (req.placeId) {
          req.body.place = req.placeId;
        }

        const errors = validateData(newEventSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        const event = await this.createEventAction.execute({
          eventData: {
            ...req.body,
            user: decoded.id,
          },
        });

        APIResponse(res, event, "Event created successfully", 201);
      } catch (error) {
        logger.error("Error creating event:", error);
        const message =
          error instanceof Error ? error.message : "Failed to create event";
        const statusCode =
          error instanceof Error && error.message === "Place not found"
            ? 404
            : error instanceof Error &&
              error.message === "You don't have permission to use this place"
            ? 403
            : 500;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default CreateEventController;
