import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IReviewRepository } from "@/types/repositories/review.repository.types";
import { ICommentRepository } from "@/types/repositories/comment.repository.types";
import { IFavoriteRepository } from "@/types/repositories/favorite.repository.types";
import { DeleteImagesAction } from "../images";
import logger from "@/utils/logger";

export interface IDeletePlaceAction {
  execute(params: { placeId: string; userId: string }): Promise<void>;
}

async function deleteCommentsOnReviews(
  commentRepository: ICommentRepository,
  reviewIds: string[]
): Promise<void> {
  if (reviewIds.length === 0) {
    return;
  }

  const direct = await commentRepository.findAll({
    filters: { reference: { $in: reviewIds }, referenceType: "Review" },
    project: ["_id"],
  });

  let frontier = direct.map((c) => c._id.toString());
  const allIds = new Set(frontier);

  while (frontier.length > 0) {
    const children = await commentRepository.findAll({
      filters: { reference: { $in: frontier }, referenceType: "Comment" },
      project: ["_id"],
    });
    const next = children
      .map((c) => c._id.toString())
      .filter((id) => !allIds.has(id));
    if (next.length === 0) {
      break;
    }
    next.forEach((id) => allIds.add(id));
    frontier = next;
  }

  if (allIds.size > 0) {
    await commentRepository.deleteMany({
      _id: { $in: [...allIds] },
    });
  }
}

class DeletePlaceAction implements IDeletePlaceAction {
  private deleteImagesAction: DeleteImagesAction;

  constructor(
    private placeRepository: IPlaceRepository,
    private userRepository: IUserRepository,
    private imageRepository: IImageRepository,
    private eventRepository: IEventRepository,
    private reviewRepository: IReviewRepository,
    private commentRepository: ICommentRepository,
    private favoriteRepository: IFavoriteRepository
  ) {
    this.deleteImagesAction = new DeleteImagesAction(this.imageRepository);
  }

  async execute(params: { placeId: string; userId: string }): Promise<void> {
    const { placeId } = params;
    const place = await this.placeRepository.findById(placeId, ["_id", "user"]);

    if (!place) {
      throw new Error("Place not found");
    }

    const placeEvents = await this.eventRepository.findAll({
      filters: { place: placeId },
      project: ["_id"],
    });
    const eventIds = placeEvents.map((event) => event._id.toString());

    const placeReviews = await this.reviewRepository.findAll({
      filters: { reference: placeId, referenceType: "Place" },
      project: ["_id"],
    });
    const eventReviews =
      eventIds.length > 0
        ? await this.reviewRepository.findAll({
            filters: {
              reference: { $in: eventIds },
              referenceType: "Event",
            },
            project: ["_id"],
          })
        : [];

    const reviewIds = [
      ...placeReviews.map((r) => r._id.toString()),
      ...eventReviews.map((r) => r._id.toString()),
    ];

    await deleteCommentsOnReviews(this.commentRepository, reviewIds);

    await this.reviewRepository.deleteMany({
      reference: placeId,
      referenceType: "Place",
    });
    if (eventIds.length > 0) {
      await this.reviewRepository.deleteMany({
        reference: { $in: eventIds },
        referenceType: "Event",
      });
    }

    const placeImages = await this.imageRepository.findAll({
      filters: {
        reference: placeId,
        referenceType: "Place",
      },
      project: ["_id"],
    });
    const placeImageIds = placeImages.map((img) => img._id.toString());

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

    const imageIds = [...placeImageIds, ...eventImageIds];

    if (imageIds.length > 0) {
      await this.deleteImagesAction.execute({ imageIds });
    }

    await this.favoriteRepository.deleteMany({
      reference: placeId,
      referenceType: "Place",
    });

    await this.placeRepository.deleteOne(placeId);
    await this.eventRepository.deleteMany({ place: placeId });

    await this.userRepository.updateOne(place.user.toString(), {
      $unset: { place: "" },
    } as any);

    logger.info(`Place ${placeId} and associated data deleted successfully`);
  }
}

export default DeletePlaceAction;
