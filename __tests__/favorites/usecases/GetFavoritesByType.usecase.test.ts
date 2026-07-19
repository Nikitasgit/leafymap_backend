import { Types } from "mongoose";
import GetFavoritesByTypeUseCase from "@src/application/usecases/favorites/GetFavoritesByType.usecase";
import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("GetFavoritesByTypeUseCase", () => {
  let favoriteRepository: jest.Mocked<IFavoriteRepository>;
  let useCase: GetFavoritesByTypeUseCase;

  beforeEach(() => {
    favoriteRepository = {
      save: jest.fn(),
      findByUserAndReference: jest.fn(),
      findReferenceIdsByUserAndType: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn(),
      deleteAllByReference: jest.fn(),
    };
    useCase = new GetFavoritesByTypeUseCase(favoriteRepository);
  });

  it("returns reference ids for the user and type", async () => {
    const userId = mockObjectId();
    const referenceIds = [mockObjectId(), mockObjectId()];

    favoriteRepository.findReferenceIdsByUserAndType.mockResolvedValue(
      referenceIds
    );

    const result = await useCase.execute({
      userId,
      referenceType: "Place",
    });

    expect(result).toEqual({ referenceIds });
    expect(favoriteRepository.findReferenceIdsByUserAndType).toHaveBeenCalled();
  });
});
