import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { IReviewTargetChecker } from "@src/domain/interfaces/IReviewTargetChecker";
import { IReviewRatingUpdater } from "@src/domain/interfaces/IReviewRatingUpdater";
import { Review } from "@src/domain/entities/Review.entity";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import {
  CreateReviewInput,
  CreateReviewOutput,
} from "@src/application/dtos/reviews/createReview.dto";
import {
  ConflictError,
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

class CreateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly targetChecker: IReviewTargetChecker,
    private readonly ratingUpdater: IReviewRatingUpdater
  ) {}

  async execute(input: CreateReviewInput): Promise<CreateReviewOutput> {
    const authorId = UserId.from(input.authorId);
    const referenceId = ReferenceId.from(input.referenceId);
    const referenceType = ReviewReferenceType.from(input.referenceType);

    const exists = await this.targetChecker.exists(referenceId, referenceType);
    if (!exists) {
      throw new NotFoundError(
        ERROR_CODES.REVIEW_REFERENCE_NOT_FOUND,
        "Review reference not found"
      );
    }

    const ownerId = await this.targetChecker.getOwnerId(
      referenceId,
      referenceType
    );
    if (ownerId && ownerId === authorId) {
      throw new ForbiddenError(
        ERROR_CODES.REVIEW_OWN_ENTITY_FORBIDDEN,
        "You cannot review your own entity"
      );
    }

    const existing = await this.reviewRepository.findByAuthorAndReference(
      authorId,
      referenceId,
      referenceType
    );
    if (existing) {
      throw new ConflictError(
        ERROR_CODES.REVIEW_ALREADY_EXISTS,
        "You have already left a review for this entity"
      );
    }

    const review = Review.create({
      authorId,
      rating: input.rating,
      comment: input.comment,
      referenceId,
      referenceType,
    });

    const id = await this.reviewRepository.save(review);
    await this.ratingUpdater.recalculate(referenceId, referenceType);

    return { id };
  }
}

export default CreateReviewUseCase;
