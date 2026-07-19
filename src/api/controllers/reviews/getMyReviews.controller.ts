import type GetMyReviewsUseCase from "@src/application/usecases/reviews/GetMyReviews.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@src/api/http/controllerFactory";

const GetMyReviewsController = (
  getMyReviewsUseCase: GetMyReviewsUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const reviews = await getMyReviewsUseCase.execute({
        authorId: requireAuth(req).id,
      });
      return { reviews };
    },
    successMessage: "Avis rédigés récupérés avec succès",
  });

export default GetMyReviewsController;
