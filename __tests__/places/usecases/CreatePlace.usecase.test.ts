import { Types } from "mongoose";
import CreatePlaceUseCase from "@src/application/usecases/places/CreatePlace.usecase";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { IUserPlaceLinker } from "@src/domain/interfaces/IUserPlaceLinker";
import { PlaceId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

const basePlaceData = {
  location: {
    type: "Point" as const,
    coordinates: [2.3522, 48.8566] as [number, number],
    label: "Paris",
    id: "paris",
  },
  placeCategoryId: mockObjectId(),
};

describe("CreatePlaceUseCase", () => {
  let placeRepository: jest.Mocked<IPlaceRepository>;
  let userPlaceLinker: jest.Mocked<IUserPlaceLinker>;
  let useCase: CreatePlaceUseCase;

  beforeEach(() => {
    placeRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findDetailsById: jest.fn(),
      findList: jest.fn(),
      findInView: jest.fn(),
      findIdsByUserId: jest.fn(),
      findAdminSummariesByUserId: jest.fn(),
      updateRating: jest.fn(),
      deleteOne: jest.fn(),
      softDelete: jest.fn(),
    };
    userPlaceLinker = {
      assertCanCreatePlace: jest.fn().mockResolvedValue(undefined),
      linkPlace: jest.fn().mockResolvedValue(undefined),
      unlinkPlace: jest.fn(),
    };
    useCase = new CreatePlaceUseCase(placeRepository, userPlaceLinker);
  });

  it("creates a place and links it to the user", async () => {
    const userId = mockObjectId();
    const placeId = PlaceId.from(mockObjectId());
    placeRepository.save.mockResolvedValue(placeId);

    const result = await useCase.execute({
      ...basePlaceData,
      userId,
    });

    expect(result).toEqual({ id: placeId });
    expect(userPlaceLinker.assertCanCreatePlace).toHaveBeenCalledWith(userId);
    expect(placeRepository.save).toHaveBeenCalled();
    expect(userPlaceLinker.linkPlace).toHaveBeenCalledWith(userId, placeId);
  });

  it("rejects when the user cannot create a place", async () => {
    userPlaceLinker.assertCanCreatePlace.mockRejectedValue({
      code: ERROR_CODES.USER_ALREADY_HAS_PLACE,
    });

    await expect(
      useCase.execute({
        ...basePlaceData,
        userId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.USER_ALREADY_HAS_PLACE,
    });

    expect(placeRepository.save).not.toHaveBeenCalled();
  });
});
