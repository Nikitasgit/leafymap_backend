import { IUserRepository } from "@/types/repositories/user.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { DeleteImagesAction } from "@/actions/images";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { ImageRepository } from "@/repositories";
import logger from "@/utils/logger";

export interface IDeleteAccountAction {
  execute(params: { userId: string }): Promise<void>;
}

class DeleteAccountAction implements IDeleteAccountAction {
  private deleteImagesAction: DeleteImagesAction;
  private imageRepository: IImageRepository;

  constructor(
    private userRepository: IUserRepository,
    private placeRepository: IPlaceRepository,
    private eventRepository: IEventRepository,
    private partnershipRepository: IPartnershipRepository
  ) {
    this.imageRepository = new ImageRepository();
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

    const userPlaces = await this.placeRepository.findAll({
      filters: { user: userId },
      project: ["_id"],
    });
    const placeIds = userPlaces.map((place) => place._id.toString());

    const userEvents = await this.eventRepository.findAll({
      filters: { place: { $in: placeIds } },
      project: ["_id"],
    });
    const eventIds = userEvents.map((event) => event._id.toString());

    const placeImageIds: string[] = [];
    if (placeIds.length > 0) {
      const placeImages = await this.imageRepository.findAll({
        filters: {
          reference: { $in: placeIds },
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
          reference: { $in: eventIds },
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
    await this.eventRepository.updateMany(
      { "schedule.timeSlots.collaborators": userId } as any,
      { $pull: { "schedule.$[].timeSlots.$[].collaborators": userId } } as any
    );
    logger.info(`Removed user from collaborators in events`);

    // Delete events for user places
    if (placeIds.length > 0) {
      await this.eventRepository.deleteMany({ place: { $in: placeIds } });
      logger.info(
        `Deleted events for ${placeIds.length} places of user ${userId}`
      );
    }

    // Delete partnerships
    await this.partnershipRepository.deleteMany({
      $or: [{ initiator: userId }, { collaborator: userId }],
    });
    logger.info(`Deleted partnerships for user ${userId}`);

    // Delete places
    if (placeIds.length > 0) {
      await this.placeRepository.deleteMany({ _id: { $in: placeIds } });
      logger.info(`Deleted ${placeIds.length} places for user ${userId}`);
    }

    // Delete user
    await this.userRepository.deleteOne(userId);
    logger.info(`User account permanently deleted: ${userId}`);
  }
}

export default DeleteAccountAction;
