import { getReviewsQuerySchema } from "../../validations/review.validations";
import {
  IGetReviewsAction,
  DEFAULT_REVIEWS_PROJECT,
} from "@/actions/reviews";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const GetReviewsController = (getReviewsAction: IGetReviewsAction): Controller =>
  createController({
    execute: async (req) => {
      const filters = validateOrThrow(getReviewsQuerySchema, req.query);
      const reviews = await getReviewsAction.execute({
        filters,
        project: DEFAULT_REVIEWS_PROJECT,
      });
      return { reviews };
    },
    successMessage: "Reviews récupérées avec succès",
  });

export default GetReviewsController;
