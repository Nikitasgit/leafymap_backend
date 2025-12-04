import { Response, NextFunction } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { createCommentSchema } from "../../validations/commentValidations";
import { ICreateCommentAction } from "../../actions/comments/CreateCommentAction";

const CreateCommentController = (createCommentAction: ICreateCommentAction) => {
  return async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authorId = req.decoded?.id;
      if (!authorId) {
        APIResponse(res, null, "Non autorisé", 401);
        return;
      }

      // Validation with Zod
      const validationResult = createCommentSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.reduce((acc, err) => {
          acc[err.path[0] as string] = err.message;
          return acc;
        }, {} as Record<string, string>);
        APIResponse(res, errors, "Données invalides", 400);
        return;
      }

      const comment = await createCommentAction.execute({
        commentData: validationResult.data,
        authorId,
      });

      APIResponse(res, comment, "Commentaire créé avec succès", 201);
    } catch (error) {
      logger.error("Erreur lors de la création du commentaire:", error);
      const message = error instanceof Error ? error.message : "Erreur serveur";
      APIResponse(res, null, message, 500);
    }
  };
};

export default CreateCommentController;
