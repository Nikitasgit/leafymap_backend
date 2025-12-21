import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";
import { UpdateReviewInput } from "../../validations/reviewValidations";
import { updateReviewRating } from "../../utils/updateReviewRating";

export interface IUpdateReviewAction {
  execute(params: {
    reviewId: string;
    reviewData: UpdateReviewInput;
  }): Promise<void>;
}

class UpdateReviewAction implements IUpdateReviewAction {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute({
    reviewId,
    reviewData,
  }: {
    reviewId: string;
    reviewData: UpdateReviewInput;
  }): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId, [
      "reference",
      "referenceType",
    ]);

    if (!review) {
      throw new Error("Review not found");
    }

    await this.reviewRepository.updateOne(reviewId, reviewData);

    await updateReviewRating(review.reference.toString(), review.referenceType);
  }
}

export default UpdateReviewAction;
