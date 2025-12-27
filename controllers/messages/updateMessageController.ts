import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { updateMessageSchema } from "../../validations/messageValidations";
import { IUpdateMessageAction } from "../../actions/messages/UpdateMessageAction";

class UpdateMessageController {
  constructor(private updateMessageAction: IUpdateMessageAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { messageId } = req.params;

        const validationResult = updateMessageSchema.safeParse(req.body);
        if (!validationResult.success) {
          const errors = validationResult.error.errors.reduce((acc, err) => {
            acc[err.path[0] as string] = err.message;
            return acc;
          }, {} as Record<string, string>);
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        await this.updateMessageAction.execute({
          messageId,
          messageData: validationResult.data,
        });

        APIResponse(res, null, "Message modifié avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la modification du message:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default UpdateMessageController;
