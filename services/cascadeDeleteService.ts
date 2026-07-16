import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { CommentId, ReferenceId } from "@src/domain/value-objects/ObjectId.vo";
import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { INotificationRepository } from "@/types/repositories/notification.repository.types";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IDeleteImagesAction } from "@/actions/images/DeleteImages.action";
import logger from "@/utils/logger";

/**
 * Centralizes cascade deletion so every entry point (delete place, delete
 * event, delete account) removes the same dependent data: reviews, comment
 * threads, bookings, invitations, favorites, notifications and images.
 */
class CascadeDeleteService {
  constructor(
    private eventRepository: IEventRepository,
    private placeRepository: IPlaceRepository,
    private reviewRepository: IReviewRepository,
    private commentRepository: ICommentRepository,
    private favoriteRepository: IFavoriteRepository,
    private eventBookingRepository: IEventBookingRepository,
    private eventInvitationRepository: IEventInvitationRepository,
    private notificationRepository: INotificationRepository,
    private imageRepository: IImageRepository,
    private deleteImagesAction: IDeleteImagesAction
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
    await this.deleteImagesAction.execute({ imageIds });
  }

  private async findImageIds(
    referenceIds: string[],
    referenceType: "Place" | "Event" | "User"
  ): Promise<string[]> {
    if (referenceIds.length === 0) return [];
    const images = await this.imageRepository.findAll({
      filters: { reference: { $in: referenceIds }, referenceType },
      project: ["_id"],
    });
    return images.map((img) => img._id.toString());
  }

  /** Deletes the given events and everything depending on them. */
  async deleteEvents(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) return;

    await this.deleteReviewsOn(eventIds, "Event");
    await this.eventBookingRepository.deleteMany({
      event: { $in: eventIds },
    });
    await this.eventInvitationRepository.deleteMany({ eventIn: eventIds });
    await this.notificationRepository.deleteByReferences(eventIds);

    const imageIds = await this.findImageIds(eventIds, "Event");
    await this.deleteImagesWithComments(imageIds);

    await this.eventRepository.deleteMany({ _id: { $in: eventIds } });

    logger.info(`Cascade-deleted ${eventIds.length} event(s)`);
  }

  /** Deletes the place, its events, and everything depending on them. */
  async deletePlace(placeId: string): Promise<void> {
    const events = await this.eventRepository.findAll({
      filters: { place: placeId },
      project: ["_id"],
    });
    await this.deleteEvents(events.map((e) => e._id.toString()));

    await this.deleteReviewsOn([placeId], "Place");
    await this.favoriteRepository.deleteAllByReference(
      ReferenceId.from(placeId),
      FavoriteReferenceType.from("Place")
    );
    await this.notificationRepository.deleteByReferences([placeId]);

    const imageIds = await this.findImageIds([placeId], "Place");
    await this.deleteImagesWithComments(imageIds);

    await this.placeRepository.deleteOne(placeId);

    logger.info(`Cascade-deleted place ${placeId}`);
  }
}

export default CascadeDeleteService;
