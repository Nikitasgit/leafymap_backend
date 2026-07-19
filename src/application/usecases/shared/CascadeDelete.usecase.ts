import DeleteImagesUseCase from "@src/application/usecases/images/DeleteImages.usecase";
import { ICascadeDeleter } from "@src/domain/interfaces/ICascadeDeleter";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import {
  CommentId,
  EventId,
  PlaceId,
  ReferenceId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import logger from "@src/shared/logger";

/**
 * Centralizes cascade deletion so every entry point (delete place, delete
 * event, delete account) removes the same dependent data: reviews, comment
 * threads, bookings, invitations, favorites, notifications and images.
 */
class CascadeDeleteUseCase implements ICascadeDeleter {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly placeRepository: IPlaceRepository,
    private readonly reviewRepository: IReviewRepository,
    private readonly commentRepository: ICommentRepository,
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly eventBookingRepository: IEventBookingRepository,
    private readonly eventInvitationRepository: IEventInvitationRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly imageRepository: IImageRepository,
    private readonly deleteImagesUseCase: DeleteImagesUseCase
  ) {}

  /**
   * Deletes comments referencing the given roots (reviews or images),
   * including nested reply threads (comments on comments).
   */
  private async deleteCommentThreads(
    rootIds: string[],
    rootType: "Review" | "Image"
  ): Promise<void> {
    if (rootIds.length === 0) return;

    const direct = await this.commentRepository.findIdsByReferences(
      rootIds.map((id) => ReferenceId.from(id)),
      CommentReferenceType.from(rootType)
    );

    let frontier = direct.map((id) => id.toString());
    const allIds = new Set(frontier);

    while (frontier.length > 0) {
      const children = await this.commentRepository.findIdsByReferences(
        frontier.map((id) => ReferenceId.from(id)),
        CommentReferenceType.from("Comment")
      );
      const next = children
        .map((id) => id.toString())
        .filter((id) => !allIds.has(id));
      if (next.length === 0) break;
      next.forEach((id) => allIds.add(id));
      frontier = next;
    }

    if (allIds.size > 0) {
      await this.commentRepository.deleteManyByIds(
        [...allIds].map((id) => CommentId.from(id))
      );
    }
  }

  /** Deletes reviews on the given references, along with their comment threads. */
  private async deleteReviewsOn(
    referenceIds: string[],
    referenceType: "Place" | "Event"
  ): Promise<void> {
    if (referenceIds.length === 0) return;

    const typedReferenceIds = referenceIds.map((id) => ReferenceId.from(id));
    const typedReferenceType = ReviewReferenceType.from(referenceType);

    const reviewIds = await this.reviewRepository.findIdsByReferences(
      typedReferenceIds,
      typedReferenceType
    );
    await this.deleteCommentThreads(
      reviewIds.map((id) => id.toString()),
      "Review"
    );
    await this.reviewRepository.deleteManyByReferences(
      typedReferenceIds,
      typedReferenceType
    );
  }

  /** Deletes the given images (DB + S3) along with their comment threads. */
  async deleteImagesWithComments(imageIds: string[]): Promise<void> {
    if (imageIds.length === 0) return;
    await this.deleteCommentThreads(imageIds, "Image");
    await this.deleteImagesUseCase.execute({ imageIds });
  }

  private async findImageIds(
    referenceIds: string[],
    referenceType: "Place" | "Event" | "User"
  ): Promise<string[]> {
    if (referenceIds.length === 0) return [];
    const imageIds = await this.imageRepository.findIdsByReferences(
      referenceIds.map((id) => ReferenceId.from(id)),
      ImageReferenceType.from(referenceType)
    );
    return imageIds.map((id) => id.toString());
  }

  /** Deletes the given events and everything depending on them. */
  async deleteEvents(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) return;

    const typedEventIds = eventIds.map((id) => EventId.from(id));

    await this.deleteReviewsOn(eventIds, "Event");
    await this.eventBookingRepository.deleteManyByEventIds(typedEventIds);
    await this.eventInvitationRepository.deleteManyByEventIds(typedEventIds);
    await this.notificationRepository.deleteByReferences(
      eventIds.map((id) => ReferenceId.from(id))
    );

    const imageIds = await this.findImageIds(eventIds, "Event");
    await this.deleteImagesWithComments(imageIds);

    await this.eventRepository.deleteManyByIds(typedEventIds);

    logger.info(`Cascade-deleted ${eventIds.length} event(s)`);
  }

  /** Deletes the place, its events, and everything depending on them. */
  async deletePlace(placeId: string): Promise<void> {
    const eventIds = await this.eventRepository.findIdsByPlace(
      PlaceId.from(placeId)
    );
    await this.deleteEvents(eventIds.map((id) => id.toString()));

    await this.deleteReviewsOn([placeId], "Place");
    await this.favoriteRepository.deleteAllByReference(
      ReferenceId.from(placeId),
      FavoriteReferenceType.from("Place")
    );
    await this.notificationRepository.deleteByReferences([
      ReferenceId.from(placeId),
    ]);

    const imageIds = await this.findImageIds([placeId], "Place");
    await this.deleteImagesWithComments(imageIds);

    await this.placeRepository.deleteOne(PlaceId.from(placeId));

    logger.info(`Cascade-deleted place ${placeId}`);
  }
}

export default CascadeDeleteUseCase;
