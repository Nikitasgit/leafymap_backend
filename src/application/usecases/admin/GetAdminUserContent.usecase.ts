import { GetAdminUserContentInput } from "@src/application/dtos/admin/getAdminUserContent.dto";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { AdminUserContentReadModel } from "@src/domain/read-models/admin.read-models";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

class GetAdminUserContentUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly placeRepository: IPlaceRepository,
    private readonly imageRepository: IImageRepository,
    private readonly reviewRepository: IReviewRepository,
    private readonly commentRepository: ICommentRepository
  ) {}

  async execute(
    params: GetAdminUserContentInput
  ): Promise<AdminUserContentReadModel> {
    const authorId = UserId.from(params.userId);
    const [events, places, images, reviews, comments] = await Promise.all([
      this.eventRepository.findByAuthorAdmin(authorId, 50),
      this.placeRepository.findAdminSummariesByUserId(authorId, 50),
      this.imageRepository.findAdminSummariesByUserId(authorId, 50),
      this.reviewRepository.findByAuthorAdmin(authorId, 50),
      this.commentRepository.findByAuthor(authorId, 50),
    ]);

    return { events, places, images, reviews, comments };
  }
}

export default GetAdminUserContentUseCase;
