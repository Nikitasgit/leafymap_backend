import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetEventsAction, GetEventsInput } from "@/actions/events";

class GetEventsController {
  constructor(private getEventsAction: IGetEventsAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { placeId, limit, lifecycleStatus } = req.query;

        const filters: GetEventsInput = {
          placeId: typeof placeId === "string" ? placeId : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
          lifecycleStatus: lifecycleStatus
            ? ((typeof lifecycleStatus === "string"
                ? lifecycleStatus.split(",")
                : lifecycleStatus) as (
                | "upcoming"
                | "ongoing"
                | "completed"
                | "unvalid"
              )[])
            : undefined,
        };

        const events = await this.getEventsAction.execute({ filters });

        APIResponse(res, events, "Events fetched successfully", 200);
      } catch (error) {
        logger.error("Error fetching events:", error);
        const message =
          error instanceof Error ? error.message : "Failed to fetch events";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetEventsController;
