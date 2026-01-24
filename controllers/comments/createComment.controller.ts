import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { createCommentSchema } from "../../validations/comment.validations";
import { ICreateCommentAction } from "@/actions/comments";
import { validateData } from "@/utils/validation";

class CreateCommentController {
  constructor(private createCommentAction: ICreateCommentAction) {}

  handle(): RequestHandler {
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

        const errors = validateData(createCommentSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        const comment = await this.createCommentAction.execute({
          commentData: createCommentSchema.parse(req.body),
          authorId,
        });

        APIResponse(res, comment, "Commentaire créé avec succès", 201);
      } catch (error) {
        logger.error("Erreur lors de la création du commentaire:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default CreateCommentController;
