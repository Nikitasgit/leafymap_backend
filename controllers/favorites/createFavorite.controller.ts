import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { ICreateFavoriteAction } from "@/actions/favorites";
import { createFavoriteSchema } from "../../validations/favorite.validations";
import { validateData } from "@/utils/validation";

class CreateFavoriteController {
  constructor(private createFavoriteAction: ICreateFavoriteAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const userId = req.decoded?.id;
        if (!userId) {
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        const errors = validateData(createFavoriteSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        const { referenceId, referenceType } = createFavoriteSchema.parse(
          req.body
        );

        const favorite = await this.createFavoriteAction.execute({
          userId,
          referenceId,
          referenceType,
        });

        APIResponse(res, favorite, "Favori ajouté avec succès", 201);
      } catch (error) {
        logger.error("Erreur lors de l'ajout du favori:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        const statusCode =
          error instanceof Error && "statusCode" in error
            ? (error.statusCode as number)
            : 500;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default CreateFavoriteController;
