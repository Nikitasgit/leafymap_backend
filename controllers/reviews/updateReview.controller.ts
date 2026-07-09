import { updateReviewSchema } from "../../validations/review.validations";
import { IUpdateReviewAction } from "@/actions/reviews";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdateReviewController = (
  updateReviewAction: IUpdateReviewAction
): Controller =>
  createController({
    execute: async (req) => {
      await updateReviewAction.execute({
        reviewId: requireObjectIdParam(req, "reviewId"),
        reviewData: validateOrThrow(updateReviewSchema, req.body),
      });
    },
    successMessage: "Review modifié avec succès",
  });

export default UpdateReviewController;
