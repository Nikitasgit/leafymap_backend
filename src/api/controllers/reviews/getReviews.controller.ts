import { getReviewsQuerySchema } from "@src/api/dto/reviews/review.dto";
import type GetReviewsUseCase from "@src/application/usecases/reviews/GetReviews.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetReviewsController = (
  getReviewsUseCase: GetReviewsUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const filters = validateOrThrow(getReviewsQuerySchema, req.query);
      const reviews = await getReviewsUseCase.execute({
        referenceId: filters.reference,
        referenceType: filters.referenceType,
        authorId: filters.author,
      });
      return { reviews };
    },
    successMessage: "Reviews récupérées avec succès",
  });

export default GetReviewsController;
