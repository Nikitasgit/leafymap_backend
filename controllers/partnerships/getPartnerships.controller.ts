import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetPartnershipsAction } from "@/actions/partnerships";

class GetPartnershipsController {
  constructor(private getPartnershipsAction: IGetPartnershipsAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { placeId, eventId } = req.params;
        const { type, onlyAccepted } = req.query;
        const currentUserId = req.decoded?.id;

        const partnerships = await this.getPartnershipsAction.execute({
          filters: {
            placeId,
            eventId: eventId as string | undefined,
            type: type as "place" | "event" | undefined,
            currentUserId,
            onlyAccepted: onlyAccepted === "true",
          },
        });

        APIResponse(
          res,
          partnerships,
          "Partnerships retrieved successfully",
          200
        );
      } catch (error) {
        logger.error("Error getting partnerships by place id:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get partnerships by place id";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetPartnershipsController;
