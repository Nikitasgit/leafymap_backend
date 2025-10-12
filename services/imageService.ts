import logger from "../utils/logger";
import { deleteObjectFromS3 } from "../utils/s3";
import Image from "../models/Image";


const deleteImages = async (imageIds: string[]): Promise<void> => {
  if (imageIds.length === 0) return;

  try {
    const imagesToDelete = await Image.find({ _id: { $in: imageIds } });
    await Image.deleteMany({ _id: { $in: imageIds } });

    // Delete all three sizes (original, thumbnail, medium) from S3
    // Using allSettled to continue even if some deletions fail
    await Promise.allSettled(
      imagesToDelete.map(async (image) => {
        if (!image.urls) {
          logger.warn(`No URLs found for image ${image._id}`);
          return;
        }
        const deleteResults = await Promise.allSettled([
          deleteObjectFromS3(image.urls.original),
          deleteObjectFromS3(image.urls.thumbnail),
          deleteObjectFromS3(image.urls.medium),
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
  } catch (error) {
    logger.error("Error deleting images:", error);
    throw error;
  }
};

export const ImageService = {
  deleteImages,
};
