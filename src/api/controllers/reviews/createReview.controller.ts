import { createReviewSchema } from "@src/api/dto/reviews/review.dto";
import type CreateReviewUseCase from "@src/application/usecases/reviews/CreateReview.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const CreateReviewController = (
  createReviewUseCase: CreateReviewUseCase
): Controller =>
  createController({
    execute: (req) => {
      const { rating, comment, reference, referenceType } = validateOrThrow(
        createReviewSchema,
        req.body
      );
      return createReviewUseCase.execute({
        authorId: requireAuth(req).id,
        rating,
        comment,
        referenceId: reference,
        referenceType,
      });
    },
    successMessage: "Review créé avec succès",
    successStatus: 201,
    mapResult: (result) => ({ _id: result.id }),
  });

export default CreateReviewController;
