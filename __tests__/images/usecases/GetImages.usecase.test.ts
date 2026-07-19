import { Types } from "mongoose";
import GetImagesUseCase from "@src/application/usecases/images/GetImages.usecase";
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

describe("GetImagesUseCase", () => {
  let imageRepository: jest.Mocked<IImageRepository>;
  let imageStorage: jest.Mocked<IImageStorage>;
  let useCase: GetImagesUseCase;

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
      signUrls: jest.fn().mockResolvedValue(signedUrls),
      deleteUrls: jest.fn(),
    };
    useCase = new GetImagesUseCase(imageRepository, imageStorage);
  });

  it("lists non-deleted images with signed urls", async () => {
    const reference = mockObjectId();
    const imageId = mockObjectId();
    const userId = mockObjectId();

    imageRepository.findList.mockResolvedValue([
      Image.reconstitute({
        id: ImageId.from(imageId),
        userId: UserId.from(userId),
        referenceId: ReferenceId.from(reference),
        referenceType: ImageReferenceType.from("Place"),
        type: ImageType.from("gallery"),
        urls,
        originalName: "photo.jpg",
        size: 1024,
        mimetype: "image/jpeg",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const result = await useCase.execute({
      reference,
      referenceType: "Place",
    });

    expect(imageRepository.findList).toHaveBeenCalledWith(
      expect.objectContaining({ deleted: false })
    );
    expect(result.images).toHaveLength(1);
    expect(result.images[0].urls).toEqual(signedUrls);
    expect(imageStorage.signUrls).toHaveBeenCalledWith(urls);
  });
});
