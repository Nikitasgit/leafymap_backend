import { IReviewRatingUpdater } from "@src/domain/interfaces/IReviewRatingUpdater";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { ReferenceId } from "@src/domain/value-objects/ObjectId.vo";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";

class LegacyReviewRatingUpdaterAdapter implements IReviewRatingUpdater {
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
        await this.placeRepository.updateOne(referenceId, {
          rating: averageRating,
        });
        break;
      case "Event":
        await this.eventRepository.updateOne(referenceId, {
          rating: averageRating,
        });
        break;
    }
  }
}

export default LegacyReviewRatingUpdaterAdapter;
