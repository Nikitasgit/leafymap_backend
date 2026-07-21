import { Types } from "mongoose";
import CreateFavoriteUseCase from "@src/application/usecases/favorites/CreateFavorite.usecase";
import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import { Favorite } from "@src/domain/entities/Favorite.entity";
import {
  FavoriteId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("CreateFavoriteUseCase", () => {
  let favoriteRepository: jest.Mocked<IFavoriteRepository>;
  let useCase: CreateFavoriteUseCase;

  beforeEach(() => {
    favoriteRepository = {
      save: jest.fn(),
      findByUserAndReference: jest.fn(),
      findReferenceIdsByUserAndType: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn(),
      deleteAllByReference: jest.fn(),
    };
    useCase = new CreateFavoriteUseCase(favoriteRepository);
  });

  it("creates a favorite and returns its id", async () => {
    const userId = mockObjectId();
    const referenceId = mockObjectId();
    const favoriteId = mockObjectId();

    favoriteRepository.findByUserAndReference.mockResolvedValue(null);
    favoriteRepository.save.mockResolvedValue(FavoriteId.from(favoriteId));

    const result = await useCase.execute({
      userId,
      referenceId,
      referenceType: "Place",
    });

    expect(result).toEqual({ id: favoriteId });
    expect(favoriteRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: UserId.from(userId),
        referenceId: ReferenceId.from(referenceId),
        referenceType: "Place",
      })
    );
  });

  it("rejects when the favorite already exists", async () => {
    const userId = mockObjectId();
    const referenceId = mockObjectId();

    favoriteRepository.findByUserAndReference.mockResolvedValue(
      Favorite.reconstitute({
        id: FavoriteId.from(mockObjectId()),
        userId: UserId.from(userId),
        referenceId: ReferenceId.from(referenceId),
        referenceType: "Place",
        createdAt: new Date(),
      })
    );

    await expect(
      useCase.execute({
        userId,
        referenceId,
        referenceType: "Place",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FAVORITE_ALREADY_EXISTS,
    });

    expect(favoriteRepository.save).not.toHaveBeenCalled();
  });
});
