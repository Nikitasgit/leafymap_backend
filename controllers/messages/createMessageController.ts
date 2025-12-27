import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { createMessageSchema } from "../../validations/messageValidations";
import { ICreateMessageAction } from "../../actions/messages/CreateMessageAction";

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

        const validationResult = createMessageSchema.safeParse(req.body);
        if (!validationResult.success) {
          const errors = validationResult.error.errors.reduce((acc, err) => {
            acc[err.path[0] as string] = err.message;
            return acc;
          }, {} as Record<string, string>);
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        const message = await this.createMessageAction.execute({
          messageData: validationResult.data,
          senderId,
        });

        APIResponse(res, message, "Message créé avec succès", 201);
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
