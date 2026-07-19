import { DeleteImagesInput } from "@src/application/dtos/images/deleteImages.dto";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { IImageStorage } from "@src/domain/interfaces/IImageStorage";
import { ImageId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";
import logger from "@src/shared/logger";

class DeleteImagesUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageStorage: IImageStorage
  ) {}

  async execute(params: DeleteImagesInput): Promise<void> {
    if (params.imageIds.length === 0) {
      return;
    }

    const imageIds = params.imageIds.map((id) => ImageId.from(id));
    const images = await this.imageRepository.findByIds(imageIds);

    if (images.length !== imageIds.length) {
      throw new NotFoundError(
        ERROR_CODES.IMAGE_NOT_FOUND,
        "Certaines images n'ont pas été trouvées"
      );
    }

    if (params.actorId) {
      const actorId = UserId.from(params.actorId);
      for (const image of images) {
        if (!image.belongsTo(actorId)) {
          throw new ForbiddenError(
            ERROR_CODES.IMAGE_FORBIDDEN,
            `Vous n'êtes pas autorisé à accéder à l'image ${image.id}`
          );
        }
      }
    }

    await this.imageRepository.deleteMany(imageIds);

    await Promise.allSettled(
      images.map(async (image) => {
        try {
          await this.imageStorage.deleteUrls(image.urls);
          logger.info(`Image ${image.id}: S3 files deleted`);
        } catch (error) {
          logger.warn(`Failed to delete S3 files for image ${image.id}`, error);
        }
      })
    );

    logger.info(
      `Successfully deleted ${imageIds.length} images from database and S3`
    );
  }
}

export default DeleteImagesUseCase;
