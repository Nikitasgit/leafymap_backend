import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IGetPartnershipsByUserIdAction } from "@/actions/partnerships";

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
        const userId = getParam(req.params, "userId");
        if (!userId) {
          APIResponse(res, null, "Missing userId", 400);
          return;
        }
        const { asCollaborator, asInitiator, status } = req.query;
        const currentUserId = req.decoded?.id;

        const validStatuses = [
          "pending",
          "accepted",
          "refused",
          "cancelled",
          "completed",
        ];
        const statusFilter =
          typeof status === "string" && validStatuses.includes(status)
            ? (status as
                | "pending"
                | "accepted"
                | "refused"
                | "cancelled"
                | "completed")
            : undefined;

        const partnerships = await this.getPartnershipsByUserIdAction.execute({
          filters: {
            userId,
            asCollaborator: asCollaborator === "true",
            asInitiator: asInitiator === "true",
            status: statusFilter,
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
