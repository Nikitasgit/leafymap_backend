import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { IReviewRatingUpdater } from "@src/domain/interfaces/IReviewRatingUpdater";
import { ReviewId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { DeleteReviewInput } from "@src/application/dtos/reviews/deleteReview.dto";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

class DeleteReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly ratingUpdater: IReviewRatingUpdater
  ) {}

  async execute(input: DeleteReviewInput): Promise<void> {
    const reviewId = ReviewId.from(input.reviewId);
    const authorId = UserId.from(input.authorId);
    const review = await this.reviewRepository.findById(reviewId);

    if (!review || !review.id) {
      throw new NotFoundError(
        ERROR_CODES.REVIEW_NOT_FOUND,
        "Review not found"
      );
    }

    if (!review.belongsTo(authorId)) {
      throw new ForbiddenError(
        ERROR_CODES.REVIEW_FORBIDDEN,
        "You can only delete your own reviews"
      );
    }

    const { referenceId, referenceType } = review;
    await this.reviewRepository.delete(review.id);
    await this.ratingUpdater.recalculate(referenceId, referenceType);
  }
}

export default DeleteReviewUseCase;
