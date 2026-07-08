import { ICommentRepository } from "@/types/repositories/comment.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IReviewRepository } from "@/types/repositories/review.repository.types";

export interface IGetAdminUserContentAction {
  execute(params: { userId: string }): Promise<Record<string, unknown[]>>;
}

class GetAdminUserContentAction implements IGetAdminUserContentAction {
  constructor(
    private eventRepository: IEventRepository,
    private placeRepository: IPlaceRepository,
    private imageRepository: IImageRepository,
    private reviewRepository: IReviewRepository,
    private commentRepository: ICommentRepository
  ) {}

  async execute({ userId }: { userId: string }): Promise<Record<string, unknown[]>> {
    const [events, places, images, reviews, comments] = await Promise.all([
      this.eventRepository.findAll({
        filters: { user: userId },
        project: ["_id", "name", "status", "deleted", "createdAt", "updatedAt"],
        limit: 50,
      }),
      this.placeRepository.findAll({
        filters: { user: userId },
        project: ["_id", "location", "deleted", "createdAt", "updatedAt"],
        limit: 50,
        sort: { createdAt: -1 },
      }),
      this.imageRepository.findAll({
        filters: { user: userId },
        project: ["_id", "type", "referenceType", "deleted", "createdAt"],
        limit: 50,
      }),
      this.reviewRepository.findAll({
        filters: { author: userId },
        project: ["_id", "rating", "comment", "referenceType", "deleted", "createdAt"],
        limit: 50,
      }),
      this.commentRepository.findAll({
        filters: { author: userId },
        project: ["_id", "content", "referenceType", "deleted", "createdAt"],
        limit: 50,
      }),
    ]);

    return { events, places, images, reviews, comments };
  }
}

export default GetAdminUserContentAction;
