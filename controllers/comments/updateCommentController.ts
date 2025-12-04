import { Response, NextFunction } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { updateCommentSchema } from "../../validations/commentValidations";
import { IUpdateCommentAction } from "../../actions/comments/UpdateCommentAction";
import { isValidObjectId } from "mongoose";

const UpdateCommentController = (updateCommentAction: IUpdateCommentAction) => {
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

      // Validation with Zod
      const validationResult = updateCommentSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.reduce((acc, err) => {
          acc[err.path[0] as string] = err.message;
          return acc;
        }, {} as Record<string, string>);
        APIResponse(res, errors, "Données invalides", 400);
        return;
      }

      await updateCommentAction.execute({
        commentId,
        commentData: validationResult.data,
      });

      APIResponse(res, null, "Commentaire modifié avec succès", 200);
    } catch (error) {
      logger.error("Erreur lors de la modification du commentaire:", error);
      const message = error instanceof Error ? error.message : "Erreur serveur";
      APIResponse(res, null, message, 500);
    }
  };
};

export default UpdateCommentController;
