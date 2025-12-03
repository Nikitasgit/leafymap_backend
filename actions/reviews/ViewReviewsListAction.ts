import {
  IReviewRepository,
  ReviewFilters,
} from "../../repositories/reviews/IReviewRepository";
import { IReview } from "../../types/models/review";

export interface IViewReviewsListAction {
  execute(params: {
    filters?: ReviewFilters;
    project?: (keyof IReview)[];
  }): Promise<IReview[] | Partial<IReview>[]>;
}

const ViewReviewsListAction = (
  reviewRepository: IReviewRepository
): IViewReviewsListAction => ({
  execute: async ({ filters, project }) => {
    const defaultProject: (keyof IReview)[] = [
      "_id",
      "author",
      "rating",
      "comment",
      "reference",
      "referenceType",
      "certified",
      "createdAt",
      "updatedAt",
    ];

    const reviews = await reviewRepository.findAll({
      filters,
      project: project || defaultProject,
    });
    return reviews;
  },
});

export default ViewReviewsListAction;
