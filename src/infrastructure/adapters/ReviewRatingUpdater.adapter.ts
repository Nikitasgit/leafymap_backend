import { IReviewRatingUpdater } from "@src/domain/interfaces/IReviewRatingUpdater";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import {
  EventId,
  PlaceId,
  ReferenceId,
} from "@src/domain/value-objects/ObjectId.vo";

class ReviewRatingUpdaterAdapter implements IReviewRatingUpdater {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly placeRepository: IPlaceRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async recalculate(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<void> {
    const ratings = await this.reviewRepository.findRatingsByReference(
      referenceId,
      referenceType
    );

    let averageRating = 0;
    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, rating) => acc + rating, 0);
      averageRating = Math.round((sum / ratings.length) * 10) / 10;
    }

    switch (referenceType) {
      case "Place":
        await this.placeRepository.updateRating(
          PlaceId.from(referenceId),
          averageRating
        );
        break;
      case "Event":
        await this.eventRepository.updateRating(
          EventId.from(referenceId),
          averageRating
        );
        break;
    }
  }
}

export default ReviewRatingUpdaterAdapter;
