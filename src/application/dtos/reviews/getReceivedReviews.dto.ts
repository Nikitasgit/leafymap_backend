import { ReviewListItem } from "@src/domain/interfaces/IReviewRepository";

export interface GetReceivedReviewsInput {
  userId: string;
}

export interface GetReceivedReviewsOutput {
  reviews: ReviewListItem[];
  noPlace: boolean;
}
