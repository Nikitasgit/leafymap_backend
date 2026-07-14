import { CustomRequest } from "@/types/custom";
import { IConversation } from "@/types/models";
import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
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
        const conversationId = getParam(req.params, "conversationId");

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

        const getParticipantId = (p: unknown): string =>
          p && typeof p === "object" && "_id" in p
            ? String((p as { _id: unknown })._id)
            : String(p);

        if (
          conversation.participants.every(
            (participant) => getParticipantId(participant) !== decoded.id
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
      } catch {
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
