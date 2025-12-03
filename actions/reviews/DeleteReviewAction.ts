import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";

export interface IDeleteReviewAction {
  execute(params: { reviewId: string }): Promise<void>;
}

const DeleteReviewAction = (
  reviewRepository: IReviewRepository
): IDeleteReviewAction => ({
  execute: async ({ reviewId }) => {
    await reviewRepository.deleteOne(reviewId);
  },
});

export default DeleteReviewAction;
