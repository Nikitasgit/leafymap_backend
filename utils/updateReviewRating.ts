import { ReviewReferenceType } from "../types/models/review";
import Place from "../models/Place";
import Event from "../models/Event";
import User from "../models/User";
import Review from "../models/Review";

/**
 * Calculate and update the average rating for a Place, Event, or User
 * @param reference - The ID of the entity (Place, Event, or User)
 * @param referenceType - The type of entity
 */
export const updateReviewRating = async (
  reference: string,
  referenceType: ReviewReferenceType
): Promise<void> => {
  // Get all reviews for this entity
  const reviews = await Review.find({
    reference,
    referenceType,
  }).select("rating");

  // Calculate average rating
  let averageRating = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    averageRating = Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
  }

  // Update the entity's rating
  switch (referenceType) {
    case "Place":
      await Place.findByIdAndUpdate(reference, { rating: averageRating });
      break;
    case "Event":
      await Event.findByIdAndUpdate(reference, { rating: averageRating });
      break;
    case "User":
      await User.findByIdAndUpdate(reference, { rating: averageRating });
      break;
  }
};
