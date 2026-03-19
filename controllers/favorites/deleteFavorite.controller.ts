import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IDeleteFavoriteAction } from "@/actions/favorites";
import { deleteFavoriteSchema } from "../../validations/favorite.validations";
import { validateData } from "@/utils/validation";

class DeleteFavoriteController {
  constructor(private deleteFavoriteAction: IDeleteFavoriteAction) {}

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

        const errors = validateData(deleteFavoriteSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        const { referenceId, referenceType } = deleteFavoriteSchema.parse(
          req.body
        );

        await this.deleteFavoriteAction.execute({
          userId,
          referenceId,
          referenceType,
        });

        APIResponse(res, null, "Favori supprimé avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la suppression du favori:", error);
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

export default DeleteFavoriteController;
