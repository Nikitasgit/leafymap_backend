import { ReviewReferenceType } from "../types/models/review";
import { IPlaceRepository } from "../repositories/places/IPlaceRepository";
import { IEventRepository } from "../repositories/events/IEventRepository";
import { IUserRepository } from "../repositories/users/IUserRepository";
import { IReviewRepository } from "../repositories/reviews/IReviewRepository";

class ReviewService {
  constructor(
    private reviewRepository: IReviewRepository,
    private placeRepository: IPlaceRepository,
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository
  ) {}

  /**
   * Calculate and update the average rating for a Place, Event, or User
   * @param reference - The ID of the entity (Place, Event, or User)
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
      case "User":
        await this.userRepository.updateOne(reference, {
          rating: averageRating,
        });
        break;
    }
  }
}

export default ReviewService;
