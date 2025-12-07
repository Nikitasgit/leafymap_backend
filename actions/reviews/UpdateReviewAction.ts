import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";
import { UpdateReviewInput } from "../../validations/reviewValidations";
import { updateReviewRating } from "../../utils/updateReviewRating";

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
    // Get the review to know the reference before updating
    const review = await reviewRepository.findById(reviewId, [
      "reference",
      "referenceType",
    ]);

    if (!review) {
      throw new Error("Review not found");
    }

    await reviewRepository.updateOne(reviewId, reviewData);

    // Update the average rating for the reviewed entity
    await updateReviewRating(review.reference.toString(), review.referenceType);
  },
});

export default UpdateReviewAction;
