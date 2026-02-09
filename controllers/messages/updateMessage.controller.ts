import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { updateMessageSchema } from "../../validations/message.validations";
import { IUpdateMessageAction } from "@/actions/messages";
import { validateData } from "@/utils/validation";

class UpdateMessageController {
  constructor(private updateMessageAction: IUpdateMessageAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const messageId = getParam(req.params, "messageId");
        if (!messageId) {
          APIResponse(res, null, "Missing messageId", 400);
          return;
        }

        const errors = validateData(updateMessageSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        await this.updateMessageAction.execute({
          messageId,
          messageData: updateMessageSchema.parse(req.body),
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
