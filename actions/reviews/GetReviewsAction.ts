import {
  IReviewRepository,
  ReviewFilters,
} from "../../repositories/reviews/IReviewRepository";
import { IReview } from "../../types/models/review";

export interface IGetReviewsAction {
  execute(params: {
    filters?: ReviewFilters;
  }): Promise<IReview[] | Partial<IReview>[]>;
}

class GetReviewsAction implements IGetReviewsAction {
  private readonly project: (keyof IReview | string)[] = [
    "_id",
    "author.username",
    "author.image.urls",
    "rating",
    "comment",
    "reference",
    "referenceType",
    "certified",
    "createdAt",
    "updatedAt",
  ];

  constructor(private reviewRepository: IReviewRepository) {}

  async execute({
    filters,
  }: {
    filters?: ReviewFilters;
  }): Promise<IReview[] | Partial<IReview>[]> {
    const reviews = await this.reviewRepository.findAll({
      filters,
      project: this.project,
    });
    return reviews;
  }
}

export default GetReviewsAction;
