import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { DeleteImagesAction } from "../images";
import logger from "@/utils/logger";

export interface IDeleteEventAction {
  execute(params: { eventId: string }): Promise<void>;
}

class DeleteEventAction implements IDeleteEventAction {
  private deleteImagesAction: DeleteImagesAction;

  constructor(
    private eventRepository: IEventRepository,
    private imageRepository: IImageRepository,
    private partnershipRepository: IPartnershipRepository
  ) {
    this.deleteImagesAction = new DeleteImagesAction(this.imageRepository);
  }

  async execute({ eventId }: { eventId: string }): Promise<void> {
    const event = await this.eventRepository.findById(eventId, ["_id"]);

    if (!event) {
      throw new Error("Event not found");
    }

    // Find all images associated with this event
    const eventImages = await this.imageRepository.findAll({
      filters: {
        reference: eventId,
        referenceType: "Event",
      },
      project: ["_id"],
    });

    const imageIds = eventImages.map((img) => img._id.toString());

    // Delete images (from DB + S3), event, and partnerships
    if (imageIds.length > 0) {
      await this.deleteImagesAction.execute({ imageIds });
    }

    await this.eventRepository.deleteOne(eventId);
    await this.partnershipRepository.deleteMany({ event: eventId });

    logger.info(`Event ${eventId} and associated data deleted successfully`);
  }
}

export default DeleteEventAction;
