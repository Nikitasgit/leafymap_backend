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
        const { partnership } = req.body;

        const createdPartnership = await this.createPartnershipsAction.execute({
          partnership,
          initiatorId: decoded.id,
        });

        APIResponse(
          res,
          createdPartnership,
          "Partnership created successfully",
          201
        );
      } catch (error) {
        logger.error("Error creating partnership:", error);
        const err = error as Error & { statusCode?: number };
        const message =
          err instanceof Error ? err.message : "Failed to create partnership";
        const statusCode = err.statusCode ?? 500;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default CreatePartnershipsController;
