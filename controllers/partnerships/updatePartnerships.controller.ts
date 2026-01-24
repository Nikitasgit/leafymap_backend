import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IUpdatePartnershipsAction } from "@/actions/partnerships";

class UpdatePartnershipsController {
  constructor(private updatePartnershipsAction: IUpdatePartnershipsAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const { partnerships } = req.body;

        await this.updatePartnershipsAction.execute({
          partnerships,
          userId: decoded.id,
        });

        APIResponse(res, null, "Partnerships updated successfully", 200);
      } catch (error) {
        logger.error("Error updating partnership:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update partnership";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default UpdatePartnershipsController;
