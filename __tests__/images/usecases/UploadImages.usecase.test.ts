import { Types } from "mongoose";
import UploadImagesUseCase from "@src/application/usecases/images/UploadImages.usecase";
import { Image } from "@src/domain/entities/Image.entity";
import { IImageReferenceOwnershipChecker } from "@src/domain/interfaces/IImageReferenceOwnershipChecker";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { IImageStorage } from "@src/domain/interfaces/IImageStorage";
import {
  ImageId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import { ImageType } from "@src/domain/value-objects/ImageType.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

const urls = {
  original: "https://example.com/original.jpg",
  thumbnail: "https://example.com/thumb.jpg",
  medium: "https://example.com/medium.jpg",
};

const signedUrls = {
  original: "https://signed.example.com/original.jpg",
  thumbnail: "https://signed.example.com/thumb.jpg",
  medium: "https://signed.example.com/medium.jpg",
};

describe("UploadImagesUseCase", () => {
  let imageRepository: jest.Mocked<IImageRepository>;
  let imageStorage: jest.Mocked<IImageStorage>;
  let ownershipChecker: jest.Mocked<IImageReferenceOwnershipChecker>;
  let useCase: UploadImagesUseCase;

  const userId = mockObjectId();
  const reference = mockObjectId();

  beforeEach(() => {
    imageRepository = {
      saveMany: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findList: jest.fn(),
      findIdsByReferences: jest.fn(),
      findIdsByUserId: jest.fn(),
      findAdminSummariesByUserId: jest.fn(),
      deleteMany: jest.fn(),
      softDelete: jest.fn(),
    };
    imageStorage = {
      upload: jest.fn().mockResolvedValue(urls),
      signUrls: jest.fn().mockResolvedValue(signedUrls),
      deleteUrls: jest.fn(),
    };
    ownershipChecker = {
      assertOwnedBy: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new UploadImagesUseCase(
      imageRepository,
      imageStorage,
      ownershipChecker
    );
  });

  it("uploads and persists images for an owned reference", async () => {
    const imageId = ImageId.from(mockObjectId());
    imageRepository.saveMany.mockResolvedValue([imageId]);
    imageRepository.findByIds.mockResolvedValue([
      Image.reconstitute({
        id: imageId,
        userId: UserId.from(userId),
        referenceId: ReferenceId.from(reference),
        referenceType: ImageReferenceType.from("Place"),
        type: ImageType.from("gallery"),
        urls,
        originalName: "photo.jpg",
        size: 10,
        mimetype: "image/jpeg",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const result = await useCase.execute({
      userId,
      reference,
      referenceType: "Place",
      type: "gallery",
      files: [
        {
          buffer: Buffer.from("img"),
          mimetype: "image/jpeg",
          originalName: "photo.jpg",
          size: 10,
        },
      ],
    });

    expect(ownershipChecker.assertOwnedBy).toHaveBeenCalled();
    expect(imageStorage.upload).toHaveBeenCalled();
    expect(result.count).toBe(1);
    expect(result.images[0].signedUrls).toEqual(signedUrls);
  });

  it("keeps only one file for profile/cover types", async () => {
    const imageId = ImageId.from(mockObjectId());
    imageRepository.saveMany.mockResolvedValue([imageId]);
    imageRepository.findByIds.mockResolvedValue([
      Image.reconstitute({
        id: imageId,
        userId: UserId.from(userId),
        referenceId: ReferenceId.from(reference),
        referenceType: ImageReferenceType.from("User"),
        type: ImageType.from("profile"),
        urls,
        originalName: "a.jpg",
        size: 1,
        mimetype: "image/jpeg",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    await useCase.execute({
      userId,
      reference,
      referenceType: "User",
      type: "profile",
      files: [
        {
          buffer: Buffer.from("a"),
          mimetype: "image/jpeg",
          originalName: "a.jpg",
          size: 1,
        },
        {
          buffer: Buffer.from("b"),
          mimetype: "image/jpeg",
          originalName: "b.jpg",
          size: 1,
        },
      ],
    });

    expect(imageStorage.upload).toHaveBeenCalledTimes(1);
  });

  it("rejects when no files are provided", async () => {
    await expect(
      useCase.execute({
        userId,
        reference,
        referenceType: "Place",
        type: "gallery",
        files: [],
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.IMAGE_NO_FILES,
      statusCode: 400,
    });
  });
});
