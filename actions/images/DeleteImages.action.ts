import { IImageRepository } from "@/types/repositories/image.repository.types";
import AwsService from "@/services/awsService";
import logger from "@/utils/logger";

export interface IDeleteImagesAction {
  execute(params: { imageIds: string[] }): Promise<void>;
}

class DeleteImagesAction implements IDeleteImagesAction {
  private awsService: AwsService;

  constructor(private imageRepository: IImageRepository) {
    this.awsService = new AwsService();
  }

  async execute({ imageIds }: { imageIds: string[] }): Promise<void> {
    if (imageIds.length === 0) return;

    const images = await this.imageRepository.findAll({
      filters: { _id: { $in: imageIds } },
      project: ["_id", "urls"],
    });

    await this.imageRepository.deleteMany(imageIds);

    await Promise.allSettled(
      images.map(async (image) => {
        if (!image.urls) {
          logger.warn(`No URLs found for image ${image._id}`);
          return;
        }
        const deleteResults = await Promise.allSettled([
          this.awsService.deleteObjectFromS3(image.urls.original),
          this.awsService.deleteObjectFromS3(image.urls.thumbnail),
          this.awsService.deleteObjectFromS3(image.urls.medium),
        ]);
        const successfulDeletions = deleteResults.filter(
          (result) => result.status === "fulfilled" && result.value
        ).length;

        logger.info(
          `Image ${image._id}: ${successfulDeletions}/3 files deleted from S3`
        );
      })
    );

    logger.info(
      `Successfully deleted ${imageIds.length} images from database and S3`
    );
  }
}

export default DeleteImagesAction;
