import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IGetMessagesAction } from "@/actions/messages";
import { MessageFilters } from "@/types/repositories/message.repository.types";

class GetMessagesController {
  constructor(private getMessagesAction: IGetMessagesAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const conversationId = getParam(req.params, "conversationId");
        const userId = req.decoded?.id;
        const { senderId, readByUserId } = req.query;

        const filters: MessageFilters = {};
        if (conversationId) {
          filters.conversation = conversationId;
        }
        if (senderId && typeof senderId === "string") {
          filters.sender = senderId;
        }
        if (readByUserId && typeof readByUserId === "string") {
          filters.readBy = readByUserId;
        }

        const result = await this.getMessagesAction.execute({
          filters,
          conversationId,
        });

        APIResponse(
          res,
          { messages: result.messages },
          "Messages récupérés avec succès",
          200
        );
      } catch (error) {
        logger.error("Erreur lors de la récupération des messages:", error);
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default GetMessagesController;
