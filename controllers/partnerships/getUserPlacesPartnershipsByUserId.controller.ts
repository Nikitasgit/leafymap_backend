import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetUserPlacesPartnershipsByUserIdAction } from "@/actions/partnerships";

class GetUserPlacesPartnershipsByUserIdController {
  constructor(
    private getUserPlacesPartnershipsByUserIdAction: IGetUserPlacesPartnershipsByUserIdAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { userId } = req.params;
        const { asCollaborator, onlyAccepted, onlyPending } = req.query;
        const currentUserId = req.decoded?.id;

        const partnerships =
          await this.getUserPlacesPartnershipsByUserIdAction.execute({
            filters: {
              userId,
              asCollaborator: asCollaborator === "true",
              currentUserId,
              onlyAccepted: onlyAccepted === "true",
              onlyPending: onlyPending === "true",
            },
          });

        APIResponse(
          res,
          partnerships,
          "User places partnerships retrieved successfully",
          200
        );
      } catch (error) {
        logger.error(
          "Error getting user places partnerships by user id:",
          error
        );
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get user places partnerships by user id";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetUserPlacesPartnershipsByUserIdController;
