import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IViewReviewsListAction } from "../../actions/reviews/ViewReviewsListAction";
import { ReviewFilters } from "../../repositories/reviews/IReviewRepository";
import { ReviewReferenceType } from "../../types/models/review";

class ViewReviewsListController {
  constructor(private viewReviewsListAction: IViewReviewsListAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { reference, referenceType, author } = req.query;

        const filters: ReviewFilters = {};
        if (reference && typeof reference === "string") {
          filters.reference = reference;
        }
        if (referenceType && typeof referenceType === "string") {
          filters.referenceType = referenceType as ReviewReferenceType;
        }
        if (author && typeof author === "string") {
          filters.author = author;
        }

        const reviews = await this.viewReviewsListAction.execute({ filters });

        APIResponse(res, { reviews }, "Reviews récupérées avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la récupération des reviews:", error);
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default ViewReviewsListController;
