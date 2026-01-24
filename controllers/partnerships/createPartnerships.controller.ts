import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { ICreatePartnershipsAction } from "@/actions/partnerships";

class CreatePartnershipsController {
  constructor(private createPartnershipsAction: ICreatePartnershipsAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const { placeId, eventId } = req.params;
        const { partnerships } = req.body;

        const createdPartnerships = await this.createPartnershipsAction.execute(
          {
            partnerships,
            placeId,
            eventId,
            initiatorId: decoded.id,
          }
        );

        APIResponse(
          res,
          createdPartnerships,
          "Partnerships created successfully",
          201
        );
      } catch (error) {
        logger.error("Error creating partnership:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create partnership";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default CreatePartnershipsController;
