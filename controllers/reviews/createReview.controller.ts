import { createReviewSchema } from "../../validations/review.validations";
import { ICreateReviewAction } from "@/actions/reviews";
import { ForbiddenError } from "@/utils/errors";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateReviewController = (
  createReviewAction: ICreateReviewAction
): Controller =>
  createController({
    execute: (req) => {
      if (req.reviewReferenceIsOwner) {
        throw new ForbiddenError(
          "Vous ne pouvez pas effectuer cette action sur votre propre entité"
        );
      }
      return createReviewAction.execute({
        reviewData: validateOrThrow(createReviewSchema, req.body),
        authorId: requireAuth(req).id,
      });
    },
    successMessage: "Review créé avec succès",
    successStatus: 201,
  });

export default CreateReviewController;
