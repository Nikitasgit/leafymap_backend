import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { IReviewRatingUpdater } from "@src/domain/interfaces/IReviewRatingUpdater";
import { ReviewId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UpdateReviewInput } from "@src/application/dtos/reviews/updateReview.dto";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

export interface IUpdateReviewUseCase {
  execute(input: UpdateReviewInput): Promise<void>;
}

class UpdateReviewUseCase implements IUpdateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly ratingUpdater: IReviewRatingUpdater
  ) {}

  async execute(input: UpdateReviewInput): Promise<void> {
    const reviewId = ReviewId.from(input.reviewId);
    const authorId = UserId.from(input.authorId);
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError(
        ERROR_CODES.REVIEW_NOT_FOUND,
        "Review not found"
      );
    }

    if (!review.belongsTo(authorId)) {
      throw new ForbiddenError(
        ERROR_CODES.REVIEW_FORBIDDEN,
        "You can only update your own reviews"
      );
    }

    const updated = review.updateRatingAndComment({
      rating: input.rating,
      comment: input.comment,
    });
    await this.reviewRepository.update(updated);
    await this.ratingUpdater.recalculate(
      review.referenceId,
      review.referenceType
    );
  }
}

export default UpdateReviewUseCase;
