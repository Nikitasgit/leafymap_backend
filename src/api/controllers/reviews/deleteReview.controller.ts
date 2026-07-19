import type DeleteReviewUseCase from "@src/application/usecases/reviews/DeleteReview.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const DeleteReviewController = (
  deleteReviewUseCase: DeleteReviewUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await deleteReviewUseCase.execute({
        reviewId: requireObjectIdParam(req, "reviewId"),
        authorId: requireAuth(req).id,
      });
    },
    successMessage: "Review supprimé avec succès",
  });

export default DeleteReviewController;
