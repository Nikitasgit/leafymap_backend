export interface CreateReviewInput {
  authorId: string;
  rating: number;
  comment?: string;
  referenceId: string;
  referenceType: string;
}

export interface CreateReviewOutput {
  id: string;
}
