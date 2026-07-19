import { UploadImagesInput, UploadImagesOutput } from "@src/application/dtos/images/uploadImages.dto";
import { Image } from "@src/domain/entities/Image.entity";
import { IImageReferenceOwnershipChecker } from "@src/domain/interfaces/IImageReferenceOwnershipChecker";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { IImageStorage } from "@src/domain/interfaces/IImageStorage";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import {
  ImageType,
  SINGLE_IMAGE_TYPES,
} from "@src/domain/value-objects/ImageType.vo";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, ValidationError } from "@src/shared/errors";

class UploadImagesUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageStorage: IImageStorage,
    private readonly ownershipChecker: IImageReferenceOwnershipChecker
  ) {}

  async execute(params: UploadImagesInput): Promise<UploadImagesOutput> {
    if (params.files.length === 0) {
      throw new ValidationError(
        { files: "Aucune image fournie" },
        ERROR_CODES.IMAGE_NO_FILES,
        "Aucune image fournie"
      );
    }

    const userId = UserId.from(params.userId);
    const referenceId = ReferenceId.from(params.reference);
    const referenceType = ImageReferenceType.from(params.referenceType);
    const type = ImageType.from(params.type);

    await this.ownershipChecker.assertOwnedBy(
      referenceId,
      referenceType,
      userId
    );

    let files = params.files;
    if (
      SINGLE_IMAGE_TYPES.includes(type) &&
      (referenceType === "Place" ||
        referenceType === "Event" ||
        referenceType === "User")
    ) {
      files = files.slice(0, 1);
    }

    const imagesToSave = await Promise.all(
      files.map(async (file) => {
        const urls = await this.imageStorage.upload({
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalName: file.originalName,
        });

        return Image.create({
          userId,
          referenceId,
          referenceType,
          type,
          urls,
          originalName: file.originalName,
          size: file.size,
          mimetype: file.mimetype,
        });
      })
    );

    const imageIds = await this.imageRepository.saveMany(imagesToSave);
    const createdImages = await this.imageRepository.findByIds(imageIds);

    const images = await Promise.all(
      createdImages.map(async (image) => {
        const signedUrls = await this.imageStorage.signUrls(image.urls);
        return {
          _id: image.id!,
          urls: signedUrls,
          signedUrls,
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

    return { images, count: images.length };
  }
}

export default UploadImagesUseCase;
