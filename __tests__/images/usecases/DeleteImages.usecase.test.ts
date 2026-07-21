import { Types } from "mongoose";
import DeleteImagesUseCase from "@src/application/usecases/images/DeleteImages.usecase";
import { Image } from "@src/domain/entities/Image.entity";
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

describe("DeleteImagesUseCase", () => {
  let imageRepository: jest.Mocked<IImageRepository>;
  let imageStorage: jest.Mocked<IImageStorage>;
  let useCase: DeleteImagesUseCase;

  const userId = mockObjectId();
  const imageId = mockObjectId();

  const makeImage = (ownerId = userId) =>
    Image.reconstitute({
      id: ImageId.from(imageId),
      userId: UserId.from(ownerId),
      referenceId: ReferenceId.from(mockObjectId()),
      referenceType: ImageReferenceType.from("Place"),
      type: ImageType.from("gallery"),
      urls,
      originalName: "photo.jpg",
      size: 1024,
      mimetype: "image/jpeg",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
      upload: jest.fn(),
      signUrl: jest.fn(),
      signUrls: jest.fn(),
      deleteUrls: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new DeleteImagesUseCase(imageRepository, imageStorage);
  });

  it("deletes images when actor is owner", async () => {
    imageRepository.findByIds.mockResolvedValue([makeImage()]);

    await useCase.execute({ imageIds: [imageId], actorId: userId });

    expect(imageRepository.deleteMany).toHaveBeenCalledWith([
      ImageId.from(imageId),
    ]);
    expect(imageStorage.deleteUrls).toHaveBeenCalledWith(urls);
  });

  it("deletes without ownership check when actorId is omitted", async () => {
    imageRepository.findByIds.mockResolvedValue([makeImage()]);

    await useCase.execute({ imageIds: [imageId] });

    expect(imageRepository.deleteMany).toHaveBeenCalled();
  });

  it("rejects when some images are missing", async () => {
    imageRepository.findByIds.mockResolvedValue([]);

    await expect(
      useCase.execute({ imageIds: [imageId], actorId: userId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.IMAGE_NOT_FOUND,
    });
  });

  it("rejects when actor is not the owner", async () => {
    imageRepository.findByIds.mockResolvedValue([makeImage()]);

    await expect(
      useCase.execute({ imageIds: [imageId], actorId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.IMAGE_FORBIDDEN,
    });

    expect(imageRepository.deleteMany).not.toHaveBeenCalled();
  });
});
