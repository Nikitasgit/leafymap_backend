import { Types } from "mongoose";
import UpdatePlaceUseCase from "@src/application/usecases/places/UpdatePlace.usecase";
import { Place } from "@src/domain/entities/Place.entity";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
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

describe("UpdatePlaceUseCase", () => {
  let placeRepository: jest.Mocked<IPlaceRepository>;
  let useCase: UpdatePlaceUseCase;

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
    useCase = new UpdatePlaceUseCase(placeRepository);
  });

  it("updates an owned place", async () => {
    const userId = mockObjectId();
    const placeId = mockObjectId();
    placeRepository.findById.mockResolvedValue(buildPlace(userId, placeId));

    await useCase.execute({
      placeId,
      userId,
      placeCategoryId: mockObjectId(),
    });

    expect(placeRepository.update).toHaveBeenCalled();
  });

  it("rejects when place is not found", async () => {
    placeRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        placeId: mockObjectId(),
        userId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PLACE_NOT_FOUND,
      statusCode: 404,
    });
  });

  it("rejects when user is not the owner", async () => {
    const placeId = mockObjectId();
    placeRepository.findById.mockResolvedValue(buildPlace(mockObjectId(), placeId));

    await expect(
      useCase.execute({
        placeId,
        userId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PLACE_FORBIDDEN,
      statusCode: 403,
    });
  });
});
