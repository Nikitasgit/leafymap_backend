import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
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
        const { conversationId, senderId, isRead } = req.query;

        const filters: MessageFilters = {};
        if (conversationId && typeof conversationId === "string") {
          filters.conversation = conversationId;
        }
        if (senderId && typeof senderId === "string") {
          filters.sender = senderId;
        }
        if (isRead !== undefined && typeof isRead === "string") {
          filters.isRead = isRead === "true";
        }

        const messages = await this.getMessagesAction.execute({ filters });

        APIResponse(res, { messages }, "Messages récupérés avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la récupération des messages:", error);
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default GetMessagesController;
