import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";

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

  async execute({
    userId,
  }: {
    userId: string;
  }): Promise<Record<string, unknown[]>> {
    const authorId = UserId.from(userId);
    const [events, places, images, reviews, comments] = await Promise.all([
      this.eventRepository.findByAuthorAdmin(authorId, 50),
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
      this.reviewRepository.findByAuthorAdmin(authorId, 50),
      this.commentRepository.findByAuthor(authorId, 50),
    ]);

    return { events, places, images, reviews, comments };
  }
}

export default GetAdminUserContentAction;
