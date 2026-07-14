import { IImageRepository } from "@/types/repositories/image.repository.types";
import AwsService, { ProcessedImageUrls } from "@/services/awsService";
import { Types } from "mongoose";
import { IImage } from "@/types/models/Image";

export interface UploadImageInput {
  file: Express.Multer.File;
  reference: string;
  referenceType: string;
  type: string;
  userId: string;
}

export interface IUploadImagesAction {
  execute(params: { images: UploadImageInput[] }): Promise<IImage[]>;
}

class UploadImagesAction implements IUploadImagesAction {
  private awsService: AwsService;

  constructor(private imageRepository: IImageRepository) {
    this.awsService = new AwsService();
  }

  async execute({ images }: { images: UploadImageInput[] }): Promise<IImage[]> {
    const imageResults = await Promise.all(
      images.map(async (input) => {
        const processedUrls = (await this.awsService.uploadToS3(
          input.file.buffer,
          "", // key not needed for images as it's generated automatically
          input.file.mimetype,
          input.file.originalname
        )) as ProcessedImageUrls;

        return {
          urls: processedUrls,
          user: new Types.ObjectId(input.userId),
          referenceType: input.referenceType,
          reference: new Types.ObjectId(input.reference),
          type: input.type,
          originalName: input.file.originalname,
          size: input.file.size,
          mimetype: input.file.mimetype,
        };
      })
    );

    const imageIds = await this.imageRepository.createMany(
      imageResults as unknown as Partial<IImage>[]
    );

    const createdImages = await this.imageRepository.findAll({
      filters: { _id: { $in: imageIds.map((id) => id.toString()) } },
      project: [
        "_id",
        "urls",
        "user",
        "reference",
        "referenceType",
        "type",
        "originalName",
        "size",
        "mimetype",
        "createdAt",
        "updatedAt",
      ],
    });

    const imagesWithSignedUrls = await Promise.all(
      createdImages.map(async (image) => {
        const signedUrls = {
          original: await this.awsService.generateSignedUrlFromFullUrl(
            image.urls.original
          ),
          thumbnail: await this.awsService.generateSignedUrlFromFullUrl(
            image.urls.thumbnail
          ),
          medium: await this.awsService.generateSignedUrlFromFullUrl(
            image.urls.medium
          ),
        };
        return {
          ...image,
          signedUrls: signedUrls,
        };
      })
    );

    return imagesWithSignedUrls as IImage[];
  }
}

export default UploadImagesAction;
