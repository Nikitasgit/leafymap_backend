import {
  IImageStorage,
  UploadImageFileParams,
} from "@src/domain/interfaces/IImageStorage";
import { ImageUrls } from "@src/domain/value-objects/ImageUrls.vo";
import AwsService, {
  ProcessedImageUrls,
} from "@src/infrastructure/services/awsService";
import logger from "@src/shared/logger";

class AwsImageStorageAdapter implements IImageStorage {
  private readonly awsService: AwsService;

  constructor(awsService?: AwsService) {
    this.awsService = awsService ?? new AwsService();
  }

  async upload(params: UploadImageFileParams): Promise<ImageUrls> {
    const processedUrls = (await this.awsService.uploadToS3(
      params.buffer,
      "",
      params.mimetype,
      params.originalName
    )) as ProcessedImageUrls;

    return {
      original: processedUrls.original,
      thumbnail: processedUrls.thumbnail,
      medium: processedUrls.medium,
    };
  }

  async signUrl(url: string): Promise<string> {
    return this.awsService.generateSignedUrlFromFullUrl(url);
  }

  async signUrls(urls: ImageUrls): Promise<ImageUrls> {
    const [original, thumbnail, medium] = await Promise.all([
      this.signUrl(urls.original),
      this.signUrl(urls.thumbnail),
      this.signUrl(urls.medium),
    ]);
    return { original, thumbnail, medium };
  }

  async deleteUrls(urls: ImageUrls): Promise<void> {
    const deleteResults = await Promise.allSettled([
      this.awsService.deleteObjectFromS3(urls.original),
      this.awsService.deleteObjectFromS3(urls.thumbnail),
      this.awsService.deleteObjectFromS3(urls.medium),
    ]);

    const successfulDeletions = deleteResults.filter(
      (result) => result.status === "fulfilled" && result.value
    ).length;

    logger.info(`S3 delete: ${successfulDeletions}/3 files deleted`);
  }
}

export default AwsImageStorageAdapter;
