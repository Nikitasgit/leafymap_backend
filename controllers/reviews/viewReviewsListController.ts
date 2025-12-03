import { Response, NextFunction } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IViewReviewsListAction } from "../../actions/reviews/ViewReviewsListAction";

const ViewReviewsListController = (
  viewReviewsListAction: IViewReviewsListAction
) => {
  return async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { reference, referenceType, author } = req.query;

      const filters: any = {};
      if (reference && typeof reference === "string") {
        filters.reference = reference;
      }
      if (referenceType && typeof referenceType === "string") {
        filters.referenceType = referenceType;
      }
      if (author && typeof author === "string") {
        filters.author = author;
      }

      const reviews = await viewReviewsListAction.execute({ filters });

      APIResponse(res, { reviews }, "Reviews récupérées avec succès", 200);
    } catch (error) {
      logger.error("Erreur lors de la récupération des reviews:", error);
      APIResponse(res, null, "Erreur serveur", 500);
    }
  };
};

export default ViewReviewsListController;
