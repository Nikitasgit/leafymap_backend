import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";
import { UpdateReviewInput } from "../../validations/reviewValidations";

export interface IUpdateReviewAction {
  execute(params: {
    reviewId: string;
    reviewData: UpdateReviewInput;
  }): Promise<void>;
}

const UpdateReviewAction = (
  reviewRepository: IReviewRepository
): IUpdateReviewAction => ({
  execute: async ({ reviewId, reviewData }) => {
    await reviewRepository.updateOne(reviewId, reviewData);
  },
});

export default UpdateReviewAction;
