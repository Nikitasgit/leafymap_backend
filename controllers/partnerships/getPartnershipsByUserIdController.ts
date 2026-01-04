import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IGetPartnershipsByUserIdAction } from "../../actions/partnerships/GetPartnershipsByUserIdAction";

class GetPartnershipsByUserIdController {
  constructor(
    private getPartnershipsByUserIdAction: IGetPartnershipsByUserIdAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { userId } = req.params;
        const { asCollaborator, includeCancelledEvents, includePastEvents } =
          req.query;
        const currentUserId = req.decoded?.id;

        const partnerships = await this.getPartnershipsByUserIdAction.execute({
          filters: {
            userId,
            asCollaborator: asCollaborator === "true",
            includeCancelledEvents: includeCancelledEvents === "true",
            includePastEvents: includePastEvents === "true",
            currentUserId,
          },
        });

        APIResponse(
          res,
          partnerships,
          "Partnerships retrieved successfully",
          200
        );
      } catch (error) {
        logger.error("Error getting partnerships by user id:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get partnerships by user id";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetPartnershipsByUserIdController;
