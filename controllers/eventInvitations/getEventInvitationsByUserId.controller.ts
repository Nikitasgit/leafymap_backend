import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IGetEventInvitationsByUserIdAction } from "@/actions/eventInvitations";

class GetEventInvitationsByUserIdController {
  constructor(
    private getEventInvitationsByUserIdAction: IGetEventInvitationsByUserIdAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const userId = getParam(req.params, "userId");
        if (!userId) {
          APIResponse(res, null, "Missing userId", 400);
          return;
        }
        const {
          asCollaborator,
          includeCancelledEvents,
          includePastEvents,
          onlyAccepted,
          onlyPending,
        } = req.query;
        const currentUserId = req.decoded?.id;

        const eventInvitations =
          await this.getEventInvitationsByUserIdAction.execute({
            filters: {
              userId,
              asCollaborator: asCollaborator === "true",
              includeCancelledEvents: includeCancelledEvents === "true",
              includePastEvents: includePastEvents === "true",
              currentUserId,
              onlyAccepted: onlyAccepted === "true",
              onlyPending: onlyPending === "true",
            },
          });

        APIResponse(
          res,
          eventInvitations,
          "Event invitations retrieved successfully",
          200
        );
      } catch (error) {
        logger.error("Error getting event invitations by user id:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get event invitations by user id";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetEventInvitationsByUserIdController;
