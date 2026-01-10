import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IGetUserEventsPartnershipsByUserIdAction } from "../../actions/partnerships/GetUserEventsPartnershipsByUserIdAction";

class GetUserEventsPartnershipsByUserIdController {
  constructor(
    private getUserEventsPartnershipsByUserIdAction: IGetUserEventsPartnershipsByUserIdAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { userId } = req.params;
        const {
          asCollaborator,
          includeCancelledEvents,
          includePastEvents,
          onlyAccepted,
        } = req.query;
        const currentUserId = req.decoded?.id;

        const partnerships =
          await this.getUserEventsPartnershipsByUserIdAction.execute({
            filters: {
              userId,
              asCollaborator: asCollaborator === "true",
              includeCancelledEvents: includeCancelledEvents === "true",
              includePastEvents: includePastEvents === "true",
              currentUserId,
              onlyAccepted: onlyAccepted === "true",
            },
          });

        APIResponse(
          res,
          partnerships,
          "User events partnerships retrieved successfully",
          200
        );
      } catch (error) {
        logger.error(
          "Error getting user events partnerships by user id:",
          error
        );
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get user events partnerships by user id";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetUserEventsPartnershipsByUserIdController;
