import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IReviewRepository } from "@/types/repositories/review.repository.types";
import { ICommentRepository } from "@/types/repositories/comment.repository.types";
import { IFavoriteRepository } from "@/types/repositories/favorite.repository.types";
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

    const direct = await this.commentRepository.findAll({
      filters: { reference: { $in: rootIds }, referenceType: rootType },
      project: ["_id"],
    });

    let frontier = direct.map((c) => c._id.toString());
    const allIds = new Set(frontier);

    while (frontier.length > 0) {
      const children = await this.commentRepository.findAll({
        filters: { reference: { $in: frontier }, referenceType: "Comment" },
        project: ["_id"],
      });
      const next = children
        .map((c) => c._id.toString())
        .filter((id) => !allIds.has(id));
      if (next.length === 0) break;
      next.forEach((id) => allIds.add(id));
      frontier = next;
    }

    if (allIds.size > 0) {
      await this.commentRepository.deleteMany({ _id: { $in: [...allIds] } });
    }
  }

  /** Deletes reviews on the given references, along with their comment threads. */
  private async deleteReviewsOn(
    referenceIds: string[],
    referenceType: "Place" | "Event"
  ): Promise<void> {
    if (referenceIds.length === 0) return;

    const reviews = await this.reviewRepository.findAll({
      filters: { reference: { $in: referenceIds }, referenceType },
      project: ["_id"],
    });
    await this.deleteCommentThreads(
      reviews.map((r) => r._id.toString()),
      "Review"
    );
    await this.reviewRepository.deleteMany({
      reference: { $in: referenceIds },
      referenceType,
    });
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
    await this.favoriteRepository.deleteMany({
      reference: placeId,
      referenceType: "Place",
    });
    await this.notificationRepository.deleteByReferences([placeId]);

    const imageIds = await this.findImageIds([placeId], "Place");
    await this.deleteImagesWithComments(imageIds);

    await this.placeRepository.deleteOne(placeId);

    logger.info(`Cascade-deleted place ${placeId}`);
  }
}

export default CascadeDeleteService;
