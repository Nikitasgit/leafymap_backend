import { IReviewRepository } from "@/types/repositories/review.repository.types";
import { UpdateReviewInput } from "../../validations/review.validations";
import ReviewService from "@/services/reviewService";

export interface IUpdateReviewAction {
  execute(params: {
    reviewId: string;
    reviewData: UpdateReviewInput;
  }): Promise<void>;
}

class UpdateReviewAction implements IUpdateReviewAction {
  private reviewService: ReviewService;

  constructor(
    private reviewRepository: IReviewRepository,
    reviewService: ReviewService
  ) {
    this.reviewService = reviewService;
  }

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

    await this.reviewService.updateReviewRating(
      review.reference.toString(),
      review.referenceType
    );
  }
}

export default UpdateReviewAction;
