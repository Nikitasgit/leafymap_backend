import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IDeleteEventAction } from "@/actions/events";

class DeleteEventController {
  constructor(private deleteEventAction: IDeleteEventAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const eventId = getParam(req.params, "eventId");

        if (!eventId) {
          APIResponse(res, null, "Event ID is required", 400);
          return;
        }

        await this.deleteEventAction.execute({ eventId });

        APIResponse(res, null, "Event deleted successfully", 200);
      } catch (error) {
        logger.error("Error deleting event:", error);
        const message =
          error instanceof Error ? error.message : "Failed to delete event";
        const statusCode =
          error instanceof Error && error.message === "Event not found"
            ? 404
            : 500;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default DeleteEventController;
