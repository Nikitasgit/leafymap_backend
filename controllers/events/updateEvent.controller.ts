import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IUpdateEventAction } from "@/actions/events";
import { updateEventSchema } from "@/validations/event.validations";
import { validateData } from "@/utils/validation";

class UpdateEventController {
  constructor(private updateEventAction: IUpdateEventAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { eventId } = req.params;

        if (!eventId) {
          APIResponse(res, null, "Event ID is required", 400);
          return;
        }

        const errors = validateData(updateEventSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        await this.updateEventAction.execute({
          eventId,
          updateData: req.body,
        });

        APIResponse(res, { _id: eventId }, "Event updated successfully", 200);
      } catch (error) {
        logger.error("Error updating event:", error);
        const message =
          error instanceof Error ? error.message : "Failed to update event";
        const statusCode =
          error instanceof Error && error.message === "Event not found"
            ? 404
            : 500;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default UpdateEventController;
