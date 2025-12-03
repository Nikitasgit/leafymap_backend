import { Response, NextFunction } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IDeleteMessageAction } from "../../actions/messages/DeleteMessageAction";

const DeleteMessageController = (deleteMessageAction: IDeleteMessageAction) => {
  return async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { messageId } = req.params;

      await deleteMessageAction.execute({ messageId });

      APIResponse(res, null, "Message supprimé avec succès", 200);
    } catch (error) {
      logger.error("Erreur lors de la suppression du message:", error);
      const message = error instanceof Error ? error.message : "Erreur serveur";
      APIResponse(res, null, message, 500);
    }
  };
};

export default DeleteMessageController;
