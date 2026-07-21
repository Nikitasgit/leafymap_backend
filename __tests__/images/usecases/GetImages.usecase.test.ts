import { Types } from "mongoose";
import GetImagesUseCase from "@src/application/usecases/images/GetImages.usecase";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";

const mockObjectId = (): string => new Types.ObjectId().toString();

const urls = {
  original: "https://example.com/original.jpg",
  thumbnail: "https://example.com/thumb.jpg",
  medium: "https://example.com/medium.jpg",
};

describe("GetImagesUseCase", () => {
  let imageRepository: jest.Mocked<IImageRepository>;
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
    useCase = new GetImagesUseCase(imageRepository);
  });

  it("lists non-deleted images with raw urls", async () => {
    const reference = mockObjectId();
    const imageId = mockObjectId();
    const userId = mockObjectId();

    imageRepository.findList.mockResolvedValue([
      {
        id: imageId,
        user: userId,
        reference,
        referenceType: "Place",
        type: "gallery",
        urls,
        originalName: "photo.jpg",
        size: 1024,
        mimetype: "image/jpeg",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await useCase.execute({
      reference,
      referenceType: "Place",
    });

    expect(imageRepository.findList).toHaveBeenCalledWith(
      expect.objectContaining({ deleted: false })
    );
    expect(result.images).toHaveLength(1);
    expect(result.images[0].urls).toEqual(urls);
  });
});
