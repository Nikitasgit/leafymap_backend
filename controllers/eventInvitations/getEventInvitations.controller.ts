import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IGetEventInvitationsAction } from "@/actions/eventInvitations";

class GetEventInvitationsController {
  constructor(private getEventInvitationsAction: IGetEventInvitationsAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const eventId = getParam(req.params, "eventId");
        if (!eventId) {
          APIResponse(res, null, "Missing eventId", 400);
          return;
        }
        const { onlyAccepted } = req.query;
        const currentUserId = req.decoded?.id;

        const eventInvitations = await this.getEventInvitationsAction.execute({
          filters: {
            eventId,
            currentUserId,
            onlyAccepted: onlyAccepted === "true",
          },
        });

        APIResponse(
          res,
          eventInvitations,
          "Event invitations retrieved successfully",
          200
        );
      } catch (error) {
        logger.error("Error getting event invitations:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get event invitations";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetEventInvitationsController;
