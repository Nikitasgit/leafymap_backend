import Place from "../models/Place";
import Event from "../models/Event";
import { ReviewReferenceType } from "../types/models/review";

/**
 * Checks if a user is the owner of a reference entity (Place, Event, or User)
 * @param userId - The user ID to check ownership for
 * @param reference - The ID of the entity (Place, Event, or User)
 * @param referenceType - The type of the entity
 * @returns Promise<boolean> - true if the user is the owner, false otherwise
 */
export const isUserOwnerOfReference = async (
  userId: string,
  reference: string,
  referenceType: ReviewReferenceType
): Promise<boolean> => {
  switch (referenceType) {
    case "Place": {
      const place = await Place.findById(reference).select("user");
      if (!place) {
        return false;
      }
      return place.user.toString() === userId;
    }

    case "Event": {
      const event = await Event.findById(reference).populate("place");
      if (!event || !event.place) {
        return false;
      }
      // After populate, place is a populated IPlace object
      return (event.place as any).user.toString() === userId;
    }

    case "User": {
      // For User references, check if it's the same user
      return reference === userId;
    }

    default:
      return false;
  }
};
