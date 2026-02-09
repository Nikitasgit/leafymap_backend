import {
  IReviewRepository,
  ReviewFilters,
} from "@/types/repositories/review.repository.types";
import { IReview } from "@/types/models/review";

export interface IGetReviewsAction {
  execute(params: {
    filters?: ReviewFilters;
    project: (keyof IReview | string)[];
  }): Promise<IReview[] | Partial<IReview>[]>;
}

/** Project par défaut pour les listes d'avis (GET /reviews, avis reçus) */
export const DEFAULT_REVIEWS_PROJECT: (keyof IReview | string)[] = [
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

export const MY_REVIEWS_WITH_PLACE_REFERENCE_PROJECT: (
  | keyof IReview
  | string
)[] = [
  ...DEFAULT_REVIEWS_PROJECT,
  "reference.location",
  "reference.user.username",
  "reference.user.image.urls",
];

class GetReviewsAction implements IGetReviewsAction {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute({
    filters,
    project,
  }: {
    filters?: ReviewFilters;
    project: (keyof IReview | string)[];
  }): Promise<IReview[] | Partial<IReview>[]> {
    const reviews = await this.reviewRepository.findAll({
      filters,
      project,
    });
    return reviews;
  }
}

export default GetReviewsAction;
