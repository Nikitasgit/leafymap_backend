import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import {
  IGetReviewsAction,
  MY_REVIEWS_WITH_PLACE_REFERENCE_PROJECT,
} from "@/actions/reviews";

class GetMyReviewsController {
  constructor(private getReviewsAction: IGetReviewsAction) {}

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

        const reviews = await this.getReviewsAction.execute({
          filters: { author: userId },
          project: MY_REVIEWS_WITH_PLACE_REFERENCE_PROJECT,
        });

        APIResponse(res, { reviews }, "Avis rédigés récupérés avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la récupération des avis rédigés:", error);
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default GetMyReviewsController;
