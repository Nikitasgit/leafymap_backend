export interface UpdateReviewInput {
  reviewId: string;
  authorId: string;
  rating?: number;
  comment?: string;
}
