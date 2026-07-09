import { IUserRepository } from "@/types/repositories/user.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { IFavoriteRepository } from "@/types/repositories/favorite.repository.types";
import { INotificationRepository } from "@/types/repositories/notification.repository.types";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import CascadeDeleteService from "@/services/cascadeDeleteService";
import logger from "@/utils/logger";

export interface IDeleteAccountAction {
  execute(params: { userId: string }): Promise<void>;
}

class DeleteAccountAction implements IDeleteAccountAction {
  constructor(
    private userRepository: IUserRepository,
    private placeRepository: IPlaceRepository,
    private eventRepository: IEventRepository,
    private partnershipRepository: IPartnershipRepository,
    private eventBookingRepository: IEventBookingRepository,
    private eventInvitationRepository: IEventInvitationRepository,
    private favoriteRepository: IFavoriteRepository,
    private notificationRepository: INotificationRepository,
    private imageRepository: IImageRepository,
    private cascadeDeleteService: CascadeDeleteService
  ) {}

  async execute({ userId }: { userId: string }): Promise<void> {
    const user = await this.userRepository.findById(userId, ["_id"]);
    if (!user) {
      throw new Error("User not found");
    }

    // Places owned by the user (cascades to their events, reviews, bookings, images...)
    const userPlaces = await this.placeRepository.findAll({
      filters: { user: userId },
      project: ["_id"],
    });
    for (const place of userPlaces) {
      await this.cascadeDeleteService.deletePlace(place._id.toString());
    }
    logger.info(`Deleted ${userPlaces.length} places for user ${userId}`);

    // Events owned directly by the user
    const ownedEvents = await this.eventRepository.findAll({
      filters: { user: userId },
      project: ["_id"],
    });
    await this.cascadeDeleteService.deleteEvents(
      ownedEvents.map((event) => event._id.toString())
    );
    logger.info(`Deleted ${ownedEvents.length} owned events for user ${userId}`);

    // Remove user from event collaborators
    await this.eventRepository.updateMany(
      { "schedule.timeSlots.collaborators": userId },
      { $pull: { "schedule.$[].timeSlots.$[].collaborators": userId } } as any
    );

    // Data linking the user to other entities
    await this.partnershipRepository.deleteMany({
      $or: [{ initiator: userId }, { collaborator: userId }],
    });
    await this.eventInvitationRepository.deleteMany({
      $or: [{ initiator: userId }, { collaborator: userId }],
    });
    await this.eventBookingRepository.deleteMany({ user: userId });
    await this.favoriteRepository.deleteMany({ user: userId });
    await this.notificationRepository.deleteByUser(userId);

    // Images owned by the user or attached to their profile
    const imagesByOwner = await this.imageRepository.findAll({
      filters: { user: userId },
      project: ["_id"],
    });
    const imagesByReference = await this.imageRepository.findAll({
      filters: { reference: userId, referenceType: "User" },
      project: ["_id"],
    });
    const userImageIds = [
      ...new Set([
        ...imagesByOwner.map((img) => img._id.toString()),
        ...imagesByReference.map((img) => img._id.toString()),
      ]),
    ];
    await this.cascadeDeleteService.deleteImagesWithComments(userImageIds);

    await this.userRepository.deleteOne(userId);
    logger.info(`User account permanently deleted: ${userId}`);
  }
}

export default DeleteAccountAction;
