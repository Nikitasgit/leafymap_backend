import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";
import { updateReviewRating } from "../../utils/updateReviewRating";

export interface IDeleteReviewAction {
  execute(params: { reviewId: string }): Promise<void>;
}

const DeleteReviewAction = (
  reviewRepository: IReviewRepository
): IDeleteReviewAction => ({
  execute: async ({ reviewId }) => {
    // Get the review to know the reference before deleting
    const review = await reviewRepository.findById(reviewId, [
      "reference",
      "referenceType",
    ]);

    if (!review) {
      throw new Error("Review not found");
    }

    await reviewRepository.deleteOne(reviewId);

    // Update the average rating for the reviewed entity
    await updateReviewRating(review.reference.toString(), review.referenceType);
  },
});

export default DeleteReviewAction;
