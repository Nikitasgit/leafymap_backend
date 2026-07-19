import { Types } from "mongoose";
import DeletePlaceUseCase from "@src/application/usecases/places/DeletePlace.usecase";
import { Place } from "@src/domain/entities/Place.entity";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { IUserPlaceLinker } from "@src/domain/interfaces/IUserPlaceLinker";
import {
  PlaceCategoryId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PlaceLocation } from "@src/domain/value-objects/PlaceLocation.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildPlace = (userId: string, placeId = mockObjectId()) =>
  Place.reconstitute({
    id: PlaceId.from(placeId),
    userId: UserId.from(userId),
    location: PlaceLocation.from({
      type: "Point",
      coordinates: [2.35, 48.85],
      label: "Paris",
      id: "paris",
    }),
    placeCategoryId: PlaceCategoryId.from(mockObjectId()),
    defaultSchedule: {} as never,
    customDates: [],
    rating: 0,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe("DeletePlaceUseCase", () => {
  let placeRepository: jest.Mocked<IPlaceRepository>;
  let userPlaceLinker: jest.Mocked<IUserPlaceLinker>;
  let cascadeDeleter: {
    deletePlace: jest.Mock;
    deleteEvents: jest.Mock;
    deleteImagesWithComments: jest.Mock;
  };
  let useCase: DeletePlaceUseCase;

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
      assertCanCreatePlace: jest.fn(),
      linkPlace: jest.fn(),
      unlinkPlace: jest.fn(),
    };
    cascadeDeleter = {
      deletePlace: jest.fn().mockResolvedValue(undefined),
      deleteEvents: jest.fn(),
      deleteImagesWithComments: jest.fn(),
    };
    useCase = new DeletePlaceUseCase(
      placeRepository,
      userPlaceLinker,
      cascadeDeleter
    );
  });

  it("cascades delete and unlinks the user place", async () => {
    const userId = mockObjectId();
    const placeId = mockObjectId();
    placeRepository.findById.mockResolvedValue(buildPlace(userId, placeId));

    await useCase.execute({ placeId, userId });

    expect(cascadeDeleter.deletePlace).toHaveBeenCalledWith(placeId);
    expect(userPlaceLinker.unlinkPlace).toHaveBeenCalledWith(userId);
  });

  it("rejects when user is not the owner", async () => {
    const placeId = mockObjectId();
    placeRepository.findById.mockResolvedValue(buildPlace(mockObjectId(), placeId));

    await expect(
      useCase.execute({ placeId, userId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PLACE_FORBIDDEN,
      statusCode: 403,
    });

    expect(cascadeDeleter.deletePlace).not.toHaveBeenCalled();
  });
});
