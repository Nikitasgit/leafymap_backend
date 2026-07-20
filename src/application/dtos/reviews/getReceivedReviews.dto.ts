import { ReviewListItemReadModel } from "@src/domain/read-models/review.read-models";

export interface GetReceivedReviewsInput {
  userId: string;
}

export interface GetReceivedReviewsOutput {
  reviews: ReviewListItemReadModel[];
  noPlace: boolean;
}
