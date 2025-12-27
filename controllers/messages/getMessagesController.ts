import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IGetMessagesAction } from "../../actions/messages/GetMessagesAction";
import { MessageFilters } from "../../repositories/messages/IMessageRepository";

class GetMessagesController {
  constructor(private getMessagesAction: IGetMessagesAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { senderId, recipientId, isRead } = req.query;

        const filters: MessageFilters = {};
        if (senderId && typeof senderId === "string") {
          filters.senderId = senderId;
        }
        if (recipientId && typeof recipientId === "string") {
          filters.recipientId = recipientId;
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
