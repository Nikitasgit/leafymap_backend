import { ReviewReferenceType } from "@/types/models/review";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IReviewRepository } from "@/types/repositories/review.repository.types";

class ReviewService {
  constructor(
    private reviewRepository: IReviewRepository,
    private placeRepository: IPlaceRepository,
    private eventRepository: IEventRepository
  ) {}

  /**
   * Calculate and update the average rating for a Place or Event
   * @param reference - The ID of the entity (Place or Event)
   * @param referenceType - The type of entity
   */
  async updateReviewRating(
    reference: string,
    referenceType: ReviewReferenceType
  ): Promise<void> {
    // Get all reviews for this entity
    const reviews = await this.reviewRepository.findAll({
      filters: {
        reference,
        referenceType,
      },
      project: ["rating"],
    });
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce(
        (acc, review) => acc + (review.rating || 0),
        0
      );
      averageRating = Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
    }

    // Update the entity's rating
    switch (referenceType) {
      case "Place":
        await this.placeRepository.updateOne(reference, {
          rating: averageRating,
        });
        break;
      case "Event":
        await this.eventRepository.updateOne(reference, {
          rating: averageRating,
        });
        break;
    }
  }
}

export default ReviewService;
