import { RequestHandler, Response, NextFunction } from "express";
import { CustomRequest } from "@/types/custom";
import { IMarkMessagesAsReadAction } from "@/actions/messages/MarkMessagesAsRead.action";
import { APIResponse } from "@/utils/response";

class MarkMessagesAsReadController {
  constructor(private markMessagesAsReadAction: IMarkMessagesAsReadAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const conversationId = req.params.conversationId;
        const userId = req.decoded?.id;

        if (!userId) {
          APIResponse(res, null, "Utilisateur non authentifié", 401);
          return;
        }

        if (!conversationId) {
          APIResponse(res, null, "ID de conversation requis", 400);
          return;
        }

        const result = await this.markMessagesAsReadAction.execute({
          conversationId,
          userId,
        });

        APIResponse(
          res,
          { markedCount: result.markedCount },
          `${result.markedCount} message(s) marqué(s) comme lu(s)`,
          200
        );
      } catch (error) {
        next(error);
      }
    };
  }
}

export default MarkMessagesAsReadController;
