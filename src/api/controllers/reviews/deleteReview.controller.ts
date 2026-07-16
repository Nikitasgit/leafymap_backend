import { IDeleteReviewUseCase } from "@src/application/usecases/reviews/DeleteReview.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeleteReviewController = (
  deleteReviewUseCase: IDeleteReviewUseCase
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
