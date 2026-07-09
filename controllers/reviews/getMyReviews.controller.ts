import {
  IGetReviewsAction,
  MY_REVIEWS_WITH_PLACE_REFERENCE_PROJECT,
} from "@/actions/reviews";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const GetMyReviewsController = (
  getReviewsAction: IGetReviewsAction
): Controller =>
  createController({
    execute: async (req) => {
      const reviews = await getReviewsAction.execute({
        filters: { author: requireAuth(req).id },
        project: MY_REVIEWS_WITH_PLACE_REFERENCE_PROJECT,
      });
      return { reviews };
    },
    successMessage: "Avis rédigés récupérés avec succès",
  });

export default GetMyReviewsController;
