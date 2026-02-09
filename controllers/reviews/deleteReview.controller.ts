import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IDeleteReviewAction } from "@/actions/reviews";

class DeleteReviewController {
  constructor(private deleteReviewAction: IDeleteReviewAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const reviewId = getParam(req.params, "reviewId");
        if (!reviewId) {
          APIResponse(res, null, "Missing reviewId", 400);
          return;
        }

        await this.deleteReviewAction.execute({ reviewId });

        APIResponse(res, null, "Review supprimé avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la suppression du review:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default DeleteReviewController;
