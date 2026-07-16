import { createReviewSchema } from "@src/api/dto/reviews/review.dto";
import { ICreateReviewUseCase } from "@src/application/usecases/reviews/CreateReview.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateReviewController = (
  createReviewUseCase: ICreateReviewUseCase
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
