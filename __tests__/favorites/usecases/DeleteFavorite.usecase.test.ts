import { Types } from "mongoose";
import DeleteFavoriteUseCase from "@src/application/usecases/favorites/DeleteFavorite.usecase";
import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import { Favorite } from "@src/domain/entities/Favorite.entity";
import {
  FavoriteId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("DeleteFavoriteUseCase", () => {
  let favoriteRepository: jest.Mocked<IFavoriteRepository>;
  let useCase: DeleteFavoriteUseCase;

  beforeEach(() => {
    favoriteRepository = {
      save: jest.fn(),
      findByUserAndReference: jest.fn(),
      findReferenceIdsByUserAndType: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn(),
      deleteAllByReference: jest.fn(),
    };
    useCase = new DeleteFavoriteUseCase(favoriteRepository);
  });

  it("deletes an existing favorite owned by the user", async () => {
    const userId = mockObjectId();
    const referenceId = mockObjectId();
    const favoriteId = FavoriteId.from(mockObjectId());

    favoriteRepository.findByUserAndReference.mockResolvedValue(
      Favorite.reconstitute({
        id: favoriteId,
        userId: UserId.from(userId),
        referenceId: ReferenceId.from(referenceId),
        referenceType: "Place",
        createdAt: new Date(),
      })
    );

    await useCase.execute({
      userId,
      referenceId,
      referenceType: "Place",
    });

    expect(favoriteRepository.delete).toHaveBeenCalledWith(favoriteId);
  });

  it("rejects when the favorite does not exist", async () => {
    favoriteRepository.findByUserAndReference.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: mockObjectId(),
        referenceId: mockObjectId(),
        referenceType: "Place",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FAVORITE_NOT_FOUND,
      statusCode: 404,
    });

    expect(favoriteRepository.delete).not.toHaveBeenCalled();
  });

  it("rejects when the favorite belongs to another user", async () => {
    const ownerId = mockObjectId();
    const otherUserId = mockObjectId();
    const referenceId = mockObjectId();

    favoriteRepository.findByUserAndReference.mockResolvedValue(
      Favorite.reconstitute({
        id: FavoriteId.from(mockObjectId()),
        userId: UserId.from(ownerId),
        referenceId: ReferenceId.from(referenceId),
        referenceType: "Place",
        createdAt: new Date(),
      })
    );

    await expect(
      useCase.execute({
        userId: otherUserId,
        referenceId,
        referenceType: "Place",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FAVORITE_FORBIDDEN,
      statusCode: 403,
    });

    expect(favoriteRepository.delete).not.toHaveBeenCalled();
  });
});
