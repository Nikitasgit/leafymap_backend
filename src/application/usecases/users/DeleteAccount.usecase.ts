import { DeleteAccountInput } from "@src/application/dtos/users/deleteAccount.dto";
import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";
import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import { ICascadeDeleter } from "@src/domain/interfaces/ICascadeDeleter";
import logger from "@src/shared/logger";

class DeleteAccountUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly placeRepository: IPlaceRepository,
    private readonly eventRepository: IEventRepository,
    private readonly partnershipRepository: IPartnershipRepository,
    private readonly eventBookingRepository: IEventBookingRepository,
    private readonly eventInvitationRepository: IEventInvitationRepository,
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly followRepository: IFollowRepository,
    private readonly productRepository: IProductRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly imageRepository: IImageRepository,
    private readonly cascadeDeleter: ICascadeDeleter
  ) {}

  async execute(params: DeleteAccountInput): Promise<void> {
    const userId = UserId.from(params.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    const userPlaces = await this.placeRepository.findIdsByUserId(userId);
    for (const placeId of userPlaces) {
      await this.cascadeDeleter.deletePlace(placeId);
    }
    logger.info(
      `Deleted ${userPlaces.length} places for user ${params.userId}`
    );

    const ownedEvents = await this.eventRepository.findIdsByOwner(userId);
    await this.cascadeDeleter.deleteEvents(
      ownedEvents.map((eventId) => eventId.toString())
    );
    logger.info(
      `Deleted ${ownedEvents.length} owned events for user ${params.userId}`
    );

    await this.eventRepository.removeCollaborator(userId);

    await this.partnershipRepository.deleteManyByUserId(userId);
    await this.eventInvitationRepository.deleteManyByUserId(userId);
    await this.eventBookingRepository.deleteManyByUserId(userId);
    await this.favoriteRepository.deleteAllByUserId(userId);
    await this.followRepository.deleteAllInvolvingUser(userId);
    await this.productRepository.deleteManyByUserId(userId);
    await this.notificationRepository.deleteByUser(userId);

    const imagesByOwner = await this.imageRepository.findIdsByUserId(userId);
    const imagesByReference = await this.imageRepository.findIdsByReferences(
      [ReferenceId.from(params.userId)],
      ImageReferenceType.from("User")
    );
    const userImageIds = [
      ...new Set([
        ...imagesByOwner.map((id) => id.toString()),
        ...imagesByReference.map((id) => id.toString()),
      ]),
    ];
    await this.cascadeDeleter.deleteImagesWithComments(userImageIds);

    await this.userRepository.deleteOne(userId);
    logger.info(`User account permanently deleted: ${params.userId}`);
  }
}

export default DeleteAccountUseCase;
