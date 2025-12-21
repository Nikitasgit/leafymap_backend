import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";
import { updateReviewRating } from "../../utils/updateReviewRating";

export interface IDeleteReviewAction {
  execute(params: { reviewId: string }): Promise<void>;
}

class DeleteReviewAction implements IDeleteReviewAction {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute({ reviewId }: { reviewId: string }): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId, [
      "reference",
      "referenceType",
    ]);

    if (!review) {
      throw new Error("Review not found");
    }

    await this.reviewRepository.deleteOne(reviewId);

    await updateReviewRating(review.reference.toString(), review.referenceType);
  }
}

export default DeleteReviewAction;
