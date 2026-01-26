import { CustomRequest } from "@/types/custom";
import { IConversation } from "@/types/models";
import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { APIResponse } from "@/utils/response";
import { NextFunction, RequestHandler, Response } from "express";
import { isValidObjectId } from "mongoose";

class ConversationMiddleware {
  constructor(private conversationRepository: IConversationRepository) {}
  ownership(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const conversationId = req.params.conversationId;

        if (!conversationId) {
          APIResponse(res, null, "Conversation ID requis", 400);
          return;
        }

        if (!isValidObjectId(conversationId)) {
          APIResponse(res, null, "ID de conversation invalide", 400);
          return;
        }

        const conversation = await this.conversationRepository.findById(
          conversationId,
          ["participants"]
        );
        if (!conversation) {
          APIResponse(res, null, "Conversation non trouvée", 404);
          return;
        }

        if (
          conversation.participants.every(
            (participant) => participant._id.toString() !== decoded.id
          )
        ) {
          APIResponse(
            res,
            null,
            "Vous n'êtes pas autorisé à consulter cette conversation",
            403
          );
          return;
        }

        req.conversation = conversation as IConversation;
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

export default ConversationMiddleware;
