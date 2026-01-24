import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { createReviewSchema } from "../../validations/review.validations";
import { ICreateReviewAction } from "@/actions/reviews";
import { validateData } from "@/utils/validation";

class CreateReviewController {
  constructor(private createReviewAction: ICreateReviewAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const authorId = req.decoded?.id;
        if (!authorId) {
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        if (req.reviewReferenceIsOwner) {
          APIResponse(
            res,
            null,
            "Vous ne pouvez pas effectuer cette action sur votre propre entité",
            403
          );
          return;
        }

        const errors = validateData(createReviewSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        const review = await this.createReviewAction.execute({
          reviewData: createReviewSchema.parse(req.body),
          authorId,
        });

        APIResponse(res, review, "Review créé avec succès", 201);
      } catch (error) {
        logger.error("Erreur lors de la création du review:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default CreateReviewController;
