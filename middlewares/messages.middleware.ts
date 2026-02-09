import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import { CustomRequest } from "@/types/custom";
import { IMessageRepository } from "@/types/repositories/message.repository.types";
import { isValidObjectId, Types } from "mongoose";

class MessagesMiddleware {
  constructor(private messageRepository: IMessageRepository) {}

  ownership(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const messageId = getParam(req.params, "messageId");

        if (!messageId) {
          APIResponse(res, null, "Message ID requis", 400);
          return;
        }

        if (!isValidObjectId(messageId)) {
          APIResponse(res, null, "ID de message invalide", 400);
          return;
        }

        const message = await this.messageRepository.findById(messageId, [
          "sender",
        ]);
        if (!message) {
          APIResponse(res, null, "Message non trouvé", 404);
          return;
        }

        if (message.sender?.toString() !== decoded.id) {
          APIResponse(
            res,
            null,
            "Vous n'êtes pas autorisé à modifier ou supprimer ce message",
            403
          );
          return;
        }

        req.message = message as any;
        next();
      } catch (error) {
        APIResponse(
          res,
          null,
          "Erreur lors de la vérification de propriété",
          500
        );
      }
    };
  }
}

export default MessagesMiddleware;
