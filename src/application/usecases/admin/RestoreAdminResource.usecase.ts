import { RestoreAdminResourceInput } from "@src/application/dtos/admin/softDeleteAdminResource.dto";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { applyAdminResourceSoftDelete } from "@src/application/usecases/admin/adminResourceSoftDelete";

class RestoreAdminResourceUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly placeRepository: IPlaceRepository,
    private readonly imageRepository: IImageRepository,
    private readonly reviewRepository: IReviewRepository,
    private readonly commentRepository: ICommentRepository
  ) {}

  async execute(params: RestoreAdminResourceInput): Promise<void> {
    await applyAdminResourceSoftDelete(
      {
        eventRepository: this.eventRepository,
        placeRepository: this.placeRepository,
        imageRepository: this.imageRepository,
        reviewRepository: this.reviewRepository,
        commentRepository: this.commentRepository,
      },
      {
        ...params,
        deleted: false,
      }
    );
  }
}

export default RestoreAdminResourceUseCase;
