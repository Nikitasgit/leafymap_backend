import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { updateReviewSchema } from "../../validations/review.validations";
import { IUpdateReviewAction } from "@/actions/reviews";
import { validateData } from "@/utils/validation";

class UpdateReviewController {
  constructor(private updateReviewAction: IUpdateReviewAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { reviewId } = req.params;

        const errors = validateData(updateReviewSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        await this.updateReviewAction.execute({
          reviewId,
          reviewData: updateReviewSchema.parse(req.body),
        });

        APIResponse(res, null, "Review modifié avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la modification du review:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default UpdateReviewController;
