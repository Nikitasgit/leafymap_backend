import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IGetReviewsAction } from "../../actions/reviews/GetReviewsAction";
import { ReviewFilters } from "../../repositories/reviews/IReviewRepository";
import { ReviewReferenceType } from "../../types/models/review";

class GetReviewsController {
  constructor(private getReviewsAction: IGetReviewsAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { reference, referenceType, author } = req.query;

        if (!reference || typeof reference !== "string") {
          APIResponse(res, null, "Le paramètre 'reference' est requis", 400);
          return;
        }

        if (!referenceType || typeof referenceType !== "string") {
          APIResponse(
            res,
            null,
            "Le paramètre 'referenceType' est requis",
            400
          );
          return;
        }

        const filters: ReviewFilters = {
          reference,
          referenceType: referenceType as ReviewReferenceType,
        };

        if (author && typeof author === "string") {
          filters.author = author;
        }

        const reviews = await this.getReviewsAction.execute({ filters });

        APIResponse(res, { reviews }, "Reviews récupérées avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la récupération des reviews:", error);
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default GetReviewsController;
