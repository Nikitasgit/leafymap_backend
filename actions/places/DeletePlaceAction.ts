import { IPlaceRepository } from "../../repositories/places/IPlaceRepository";
import { IUserRepository } from "../../repositories/users/IUserRepository";
import { IImageRepository } from "../../repositories/images/IImageRepository";
import { IEventRepository } from "../../repositories/events/IEventRepository";
import { IPartnershipRepository } from "../../repositories/partnerships/IPartnershipRepository";
import DeleteImagesAction from "../images/DeleteImagesAction";
import logger from "../../utils/logger";

export interface IDeletePlaceAction {
  execute(params: { placeId: string; userId: string }): Promise<void>;
}

class DeletePlaceAction implements IDeletePlaceAction {
  private deleteImagesAction: DeleteImagesAction;

  constructor(
    private placeRepository: IPlaceRepository,
    private userRepository: IUserRepository,
    private imageRepository: IImageRepository,
    private eventRepository: IEventRepository,
    private partnershipRepository: IPartnershipRepository
  ) {
    this.deleteImagesAction = new DeleteImagesAction(this.imageRepository);
  }

  async execute({
    placeId,
    userId,
  }: {
    placeId: string;
    userId: string;
  }): Promise<void> {
    const place = await this.placeRepository.findById(placeId, ["_id"]);

    if (!place) {
      throw new Error("Place not found");
    }

    // Cascade deletion: find all associated events
    const placeEvents = await this.eventRepository.findAll({
      filters: { place: placeId },
      project: ["_id"],
    });
    const eventIds = placeEvents.map((event) => event._id.toString());

    // Gather all images to delete: both from events and from the place itself
    const eventImageIds: string[] = [];
    if (eventIds.length > 0) {
      const eventsImages = await this.imageRepository.findAll({
        filters: {
          reference: { $in: eventIds },
          referenceType: "Event",
        },
        project: ["_id"],
      });
      eventImageIds.push(...eventsImages.map((img) => img._id.toString()));
    }

    const placeImages = await this.imageRepository.findAll({
      filters: { reference: placeId, referenceType: "Place" },
      project: ["_id"],
    });
    const placeImageIds = placeImages.map((img) => img._id.toString());

    const imageIds = [...eventImageIds, ...placeImageIds];

    // Delete everything: images (from DB + S3), place, events, partnerships, and user reference
    if (imageIds.length > 0) {
      await this.deleteImagesAction.execute({ imageIds });
    }

    await this.placeRepository.deleteOne(placeId);
    await this.eventRepository.deleteMany({ place: placeId });
    await this.partnershipRepository.deleteMany({ place: placeId });
    await this.userRepository.updateOne(userId, {
      $pull: { places: placeId },
    } as any);

    logger.info(`Place ${placeId} and associated data deleted successfully`);
  }
}

export default DeletePlaceAction;
