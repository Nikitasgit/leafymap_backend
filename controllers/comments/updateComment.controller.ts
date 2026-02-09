import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { updateCommentSchema } from "../../validations/comment.validations";
import { IUpdateCommentAction } from "@/actions/comments";
import { isValidObjectId } from "mongoose";
import { validateData } from "@/utils/validation";

class UpdateCommentController {
  constructor(private updateCommentAction: IUpdateCommentAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const commentId = getParam(req.params, "commentId");
        const userId = req.decoded?.id;

        if (!userId) {
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        if (!commentId || !isValidObjectId(commentId)) {
          APIResponse(res, null, "ID de commentaire invalide", 400);
          return;
        }

        const errors = validateData(updateCommentSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        await this.updateCommentAction.execute({
          commentId,
          commentData: updateCommentSchema.parse(req.body),
        });

        APIResponse(res, null, "Commentaire modifié avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la modification du commentaire:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default UpdateCommentController;
