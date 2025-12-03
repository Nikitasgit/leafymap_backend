import { Response, NextFunction } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { createReviewSchema } from "../../validations/reviewValidations";
import { ICreateReviewAction } from "../../actions/reviews/CreateReviewAction";

const CreateReviewController = (createReviewAction: ICreateReviewAction) => {
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

      // Validation with Zod
      const validationResult = createReviewSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.reduce((acc, err) => {
          acc[err.path[0] as string] = err.message;
          return acc;
        }, {} as Record<string, string>);
        APIResponse(res, errors, "Données invalides", 400);
        return;
      }

      const review = await createReviewAction.execute({
        reviewData: validationResult.data,
        authorId,
      });

      APIResponse(res, review, "Review créé avec succès", 201);
    } catch (error) {
      logger.error("Erreur lors de la création du review:", error);
      const message = error instanceof Error ? error.message : "Erreur serveur";
      APIResponse(res, null, message, 500);
    }
  };
};

export default CreateReviewController;
