import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";
import ReviewService from "../../services/reviewService";

export interface IDeleteReviewAction {
  execute(params: { reviewId: string }): Promise<void>;
}

class DeleteReviewAction implements IDeleteReviewAction {
  private reviewService: ReviewService;

  constructor(
    private reviewRepository: IReviewRepository,
    reviewService: ReviewService
  ) {
    this.reviewService = reviewService;
  }

  async execute({ reviewId }: { reviewId: string }): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId, [
      "reference",
      "referenceType",
    ]);

    if (!review) {
      throw new Error("Review not found");
    }

    await this.reviewRepository.deleteOne(reviewId);

    await this.reviewService.updateReviewRating(
      review.reference.toString(),
      review.referenceType
    );
  }
}

export default DeleteReviewAction;
