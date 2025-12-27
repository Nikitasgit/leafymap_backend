import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IDeleteCommentAction } from "../../actions/comments/DeleteCommentAction";
import { isValidObjectId } from "mongoose";

class DeleteCommentController {
  constructor(private deleteCommentAction: IDeleteCommentAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { commentId } = req.params;
        const userId = req.decoded?.id;

        if (!userId) {
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        if (!isValidObjectId(commentId)) {
          APIResponse(res, null, "ID de commentaire invalide", 400);
          return;
        }

        await this.deleteCommentAction.execute({ commentId });

        APIResponse(res, null, "Commentaire supprimé avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la suppression du commentaire:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default DeleteCommentController;
