import {
  GetImagesInput,
  GetImagesOutput,
} from "@src/application/dtos/images/getImages.dto";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { IImageStorage } from "@src/domain/interfaces/IImageStorage";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import { ImageType } from "@src/domain/value-objects/ImageType.vo";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

class GetImagesUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageStorage: IImageStorage
  ) {}

  async execute(params: GetImagesInput): Promise<GetImagesOutput> {
    const images = await this.imageRepository.findList({
      referenceId: ReferenceId.from(params.reference),
      referenceType: ImageReferenceType.from(params.referenceType),
      type: params.type ? ImageType.from(params.type) : undefined,
      userId: params.userId ? UserId.from(params.userId) : undefined,
      deleted: false,
    });

    const items = await Promise.all(
      images.map(async (image) => {
        const signedUrls = await this.imageStorage.signUrls(image.urls);
        return {
          _id: image.id!,
          urls: signedUrls,
          user: image.userId,
          reference: image.referenceId,
          referenceType: image.referenceType,
          type: image.type,
          originalName: image.originalName,
          size: image.size,
          mimetype: image.mimetype,
          createdAt: image.createdAt,
          updatedAt: image.updatedAt,
        };
      })
    );

    return { images: items };
  }
}

export default GetImagesUseCase;
