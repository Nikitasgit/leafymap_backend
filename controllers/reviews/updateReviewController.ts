import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { updateReviewSchema } from "../../validations/reviewValidations";
import { IUpdateReviewAction } from "../../actions/reviews/UpdateReviewAction";

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

        const validationResult = updateReviewSchema.safeParse(req.body);
        if (!validationResult.success) {
          const errors = validationResult.error.errors.reduce((acc, err) => {
            acc[err.path[0] as string] = err.message;
            return acc;
          }, {} as Record<string, string>);
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        await this.updateReviewAction.execute({
          reviewId,
          reviewData: validationResult.data,
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
