import { IDeleteReviewAction } from "@/actions/reviews";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeleteReviewController = (
  deleteReviewAction: IDeleteReviewAction
): Controller =>
  createController({
    execute: async (req) => {
      await deleteReviewAction.execute({
        reviewId: requireObjectIdParam(req, "reviewId"),
      });
    },
    successMessage: "Review supprimé avec succès",
  });

export default DeleteReviewController;
