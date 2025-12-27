import { IUserRepository } from "../../repositories/users/IUserRepository";
import Place from "../../models/Place";
import Event from "../../models/Event";
import { Partnership } from "../../models/Partnership";
import DeleteImagesAction from "../images/DeleteImagesAction";
import { IImageRepository } from "../../repositories/images/IImageRepository";
import MongooseImageRepository from "../../repositories/images/MongooseImageRepository";
import logger from "../../utils/logger";

export interface IDeleteAccountAction {
  execute(params: { userId: string }): Promise<void>;
}

class DeleteAccountAction implements IDeleteAccountAction {
  private deleteImagesAction: DeleteImagesAction;
  private imageRepository: IImageRepository;

  constructor(private userRepository: IUserRepository) {
    this.imageRepository = new MongooseImageRepository();
    this.deleteImagesAction = new DeleteImagesAction(this.imageRepository);
  }

  async execute({ userId }: { userId: string }): Promise<void> {
    const user = await this.userRepository.findById(userId, ["_id"]);
    if (!user) {
      throw new Error("User not found");
    }

    const userImagesByOwner = await this.imageRepository.findAll({
      filters: { user: userId },
      project: ["_id"],
    });

    const userImagesByReference = await this.imageRepository.findAll({
      filters: { reference: userId, referenceType: "User" },
      project: ["_id"],
    });
    const userImageIds = [
      ...userImagesByOwner.map((img) => img._id.toString()),
      ...userImagesByReference.map((img) => img._id.toString()),
    ];

    const userPlaces = await Place.find({ user: userId });
    const placeIds = userPlaces.map((place) => place._id.toString());

    const userEvents = await Event.find({ place: { $in: placeIds } });
    const eventIds = userEvents.map((event) => event._id.toString());

    const placeImageIds: string[] = [];
    if (placeIds.length > 0) {
      const placeImages = await this.imageRepository.findAll({
        filters: {
          reference: { $in: placeIds } as any,
          referenceType: "Place",
        },
        project: ["_id"],
      });
      placeImageIds.push(...placeImages.map((img) => img._id.toString()));
    }

    // Find images for events using $in filter
    const eventImageIds: string[] = [];
    if (eventIds.length > 0) {
      const eventImages = await this.imageRepository.findAll({
        filters: {
          reference: { $in: eventIds } as any,
          referenceType: "Event",
        },
        project: ["_id"],
      });
      eventImageIds.push(...eventImages.map((img) => img._id.toString()));
    }

    // Combine all image IDs
    const allImageIds = [...userImageIds, ...placeImageIds, ...eventImageIds];

    // Delete images from S3 and database
    if (allImageIds.length > 0) {
      await this.deleteImagesAction.execute({ imageIds: allImageIds });
    }

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
