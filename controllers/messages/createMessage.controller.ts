import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { createMessageSchema } from "../../validations/message.validations";
import { ICreateMessageAction } from "@/actions/messages";
import { validateData } from "@/utils/validation";
import { getSocketService } from "@/services/socket/socketInstance";

class CreateMessageController {
  constructor(private createMessageAction: ICreateMessageAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const senderId = req.decoded?.id;
        if (!senderId) {
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        // Vérifier que le body existe
        if (!req.body || Object.keys(req.body).length === 0) {
          APIResponse(
            res,
            {
              recipientId: "Le destinataire est requis",
              content: "Le contenu du message est requis",
            },
            "Données invalides",
            400
          );
          return;
        }

        const errors = validateData(createMessageSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        const result = await this.createMessageAction.execute({
          messageData: createMessageSchema.parse(req.body),
          senderId,
        });

        const socketService = getSocketService();
        if (socketService && result.message) {
          socketService.emitNewMessage(result.conversationId, result.message);
        }

        APIResponse(res, { _id: result._id }, "Message créé avec succès", 201);
      } catch (error) {
        logger.error("Erreur lors de la création du message:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default CreateMessageController;
