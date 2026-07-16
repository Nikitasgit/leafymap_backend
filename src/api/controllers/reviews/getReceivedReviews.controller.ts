import { IGetReceivedReviewsUseCase } from "@src/application/usecases/reviews/GetReceivedReviews.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@/utils/controllerFactory";

const GetReceivedReviewsController = (
  getReceivedReviewsUseCase: IGetReceivedReviewsUseCase
): Controller =>
  createController({
    execute: async (req) => {
      return getReceivedReviewsUseCase.execute({
        userId: requireAuth(req).id,
      });
    },
    successMessage: (result) =>
      result.noPlace
        ? "Aucun lieu associé à votre compte"
        : "Avis reçus récupérés avec succès",
    mapResult: ({ reviews }) => ({ reviews }),
  });

export default GetReceivedReviewsController;
