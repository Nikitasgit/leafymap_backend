import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { DeleteImagesAction } from "../images";
import logger from "@/utils/logger";

export interface IDeletePlaceAction {
  execute(params: { placeId: string; userId: string }): Promise<void>;
}

class DeletePlaceAction implements IDeletePlaceAction {
  private deleteImagesAction: DeleteImagesAction;

  constructor(
    private placeRepository: IPlaceRepository,
    private userRepository: IUserRepository,
    private imageRepository: IImageRepository,
    private eventRepository: IEventRepository
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
    const place = await this.placeRepository.findById(placeId, ["_id", "user"]);

    if (!place) {
      throw new Error("Place not found");
    }

    const placeEvents = await this.eventRepository.findAll({
      filters: { place: placeId },
      project: ["_id"],
    });
    const eventIds = placeEvents.map((event) => event._id.toString());

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

    const imageIds = [...eventImageIds];

    if (imageIds.length > 0) {
      await this.deleteImagesAction.execute({ imageIds });
    }

    await this.placeRepository.deleteOne(placeId);
    await this.eventRepository.deleteMany({ place: placeId });

    await this.userRepository.updateOne(place.user.toString(), {
      $unset: { place: "" },
    } as any);

    logger.info(`Place ${placeId} and associated data deleted successfully`);
  }
}

export default DeletePlaceAction;
