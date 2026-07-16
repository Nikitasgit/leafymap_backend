import { IGetMyReviewsUseCase } from "@src/application/usecases/reviews/GetMyReviews.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@/utils/controllerFactory";

const GetMyReviewsController = (
  getMyReviewsUseCase: IGetMyReviewsUseCase
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
