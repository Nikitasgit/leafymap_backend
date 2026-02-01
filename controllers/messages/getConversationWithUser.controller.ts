import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetConversationWithUserAction } from "@/actions/messages/GetConversationWithUser.action";

class GetConversationWithUserController {
  constructor(
    private getConversationWithUserAction: IGetConversationWithUserAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { otherUserId } = req.params;
        const userId = req.decoded?.id;

        if (!userId) {
          APIResponse(res, null, "User not authenticated", 401);
          return;
        }

        const result = await this.getConversationWithUserAction.execute({
          userId,
          otherUserId,
        });

        APIResponse(
          res,
          result,
          "Conversation check completed successfully",
          200
        );
      } catch (error) {
        logger.error("Error checking conversation with user:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to check conversation";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetConversationWithUserController;
