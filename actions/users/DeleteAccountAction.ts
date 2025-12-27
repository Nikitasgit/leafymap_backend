import { IUserRepository } from "../../repositories/users/IUserRepository";
import Image from "../../models/Image";
import Place from "../../models/Place";
import Event from "../../models/Event";
import { Partnership } from "../../models/Partnership";
import { ImageService } from "../../services";
import logger from "../../utils/logger";

export interface IDeleteAccountAction {
  execute(params: { userId: string }): Promise<void>;
}

class DeleteAccountAction implements IDeleteAccountAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({ userId }: { userId: string }): Promise<void> {
    const user = await this.userRepository.findById(userId, ["_id"]);
    if (!user) {
      throw new Error("User not found");
    }

    // Find all user images
    const userImages = await Image.find({
      $or: [{ user: userId }, { reference: userId, referenceType: "User" }],
    });

    // Find user places
    const userPlaces = await Place.find({ user: userId });
    const placeIds = userPlaces.map((place) => place._id);

    // Find events for these places
    const userEvents = await Event.find({ place: { $in: placeIds } });
    const eventIds = userEvents.map((event) => event._id);

    // Find images for places and events
    const placeImages = await Image.find({
      reference: { $in: placeIds },
      referenceType: "Place",
    });
    const eventImages = await Image.find({
      reference: { $in: eventIds },
      referenceType: "Event",
    });

    // Combine all images to delete
    const allImagesToDelete = [...userImages, ...placeImages, ...eventImages];
    const imageIds = allImagesToDelete.map((img) => img._id.toString());

    // Delete images from S3 and database
    await ImageService.deleteImages(imageIds);

    // Remove user from event collaborators
    const eventsUpdated = await Event.updateMany(
      { "schedule.timeSlots.collaborators": userId },
      { $pull: { "schedule.$[].timeSlots.$[].collaborators": userId } }
    );
    logger.info(
      `Removed user from collaborators in ${eventsUpdated.modifiedCount} events`
    );

    // Delete events for user places
    if (placeIds.length > 0) {
      await Event.deleteMany({ place: { $in: placeIds } });
      logger.info(
        `Deleted events for ${placeIds.length} places of user ${userId}`
      );
    }

    // Delete partnerships
    const partnershipsDeleted = await Partnership.deleteMany({
      $or: [{ initiator: userId }, { collaborator: userId }],
    });
    logger.info(
      `Deleted ${partnershipsDeleted.deletedCount} partnerships for user ${userId}`
    );

    // Delete places
    if (placeIds.length > 0) {
      await Place.deleteMany({ _id: { $in: placeIds } });
      logger.info(`Deleted ${placeIds.length} places for user ${userId}`);
    }

    // Delete user
    await this.userRepository.deleteOne(userId);
    logger.info(`User account permanently deleted: ${userId}`);
  }
}

export default DeleteAccountAction;
