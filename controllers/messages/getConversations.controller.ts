import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetConversationsAction } from "@/actions/messages";

class GetConversationsController {
  constructor(private getConversationsAction: IGetConversationsAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const userId = req.decoded?.id;
        if (!userId) {
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        const conversations = await this.getConversationsAction.execute({
          userId,
        });

        APIResponse(
          res,
          conversations,
          "Conversations récupérées avec succès",
          200
        );
      } catch (error) {
        logger.error(
          "Erreur lors de la récupération des conversations:",
          error
        );
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default GetConversationsController;
