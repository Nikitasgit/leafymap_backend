import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IAcceptCguAction } from "@/actions/auth";

class AcceptCguController {
  constructor(private acceptCguAction: IAcceptCguAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const { emailNotifications } = req.body ?? {};
        if (
          emailNotifications !== undefined &&
          typeof emailNotifications !== "boolean"
        ) {
          APIResponse(res, null, "Invalid email notification preference", 400);
          return;
        }
        await this.acceptCguAction.execute({
          userId: decoded.id,
          emailNotifications,
        });
        APIResponse(res, null, "CGU accepted", 200);
      } catch (error) {
        logger.error("Error in acceptCgu:", error);
        const message =
          error instanceof Error ? error.message : "Failed to accept CGU";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default AcceptCguController;
