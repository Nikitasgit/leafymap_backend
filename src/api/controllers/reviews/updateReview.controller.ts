import { updateReviewSchema } from "@src/api/dto/reviews/review.dto";
import { IUpdateReviewUseCase } from "@src/application/usecases/reviews/UpdateReview.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdateReviewController = (
  updateReviewUseCase: IUpdateReviewUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const data = validateOrThrow(updateReviewSchema, req.body);
      await updateReviewUseCase.execute({
        reviewId: requireObjectIdParam(req, "reviewId"),
        authorId: requireAuth(req).id,
        rating: data.rating,
        comment: data.comment,
      });
    },
    successMessage: "Review modifié avec succès",
  });

export default UpdateReviewController;
