import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IFindFavoritesByUserAndTypeAction } from "@/actions/favorites";
import {
  findFavoritesByTypeQuerySchema,
} from "../../validations/favorite.validations";
import { validateData } from "@/utils/validation";

class FindFavoritesByTypeController {
  constructor(
    private findFavoritesByUserAndTypeAction: IFindFavoritesByUserAndTypeAction
  ) {}

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

        const errors = validateData(
          findFavoritesByTypeQuerySchema,
          req.query
        );
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        const { referenceType } = findFavoritesByTypeQuerySchema.parse(
          req.query
        );

        const ids = await this.findFavoritesByUserAndTypeAction.execute({
          userId,
          referenceType,
        });

        APIResponse(res, { ids }, "Favoris récupérés avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la récupération des favoris:", error);
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

export default FindFavoritesByTypeController;
