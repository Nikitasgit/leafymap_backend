import { Types } from "mongoose";
import GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("GetPlaceByIdUseCase", () => {
  let placeRepository: jest.Mocked<IPlaceRepository>;
  let eventRepository: jest.Mocked<Pick<IEventRepository, "findByPlaceInDateRange">>;
  let useCase: GetPlaceByIdUseCase;

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
    eventRepository = {
      findByPlaceInDateRange: jest.fn(),
    };
    useCase = new GetPlaceByIdUseCase(
      placeRepository,
      eventRepository as unknown as IEventRepository
    );
  });

  it("returns place details", async () => {
    const placeId = mockObjectId();
    const details = { id: placeId, rating: 4, deleted: false };
    placeRepository.findDetailsById.mockResolvedValue(details);

    const result = await useCase.execute({ placeId });

    expect(result).toEqual(details);
    expect(eventRepository.findByPlaceInDateRange).not.toHaveBeenCalled();
  });

  it("rejects deleted places", async () => {
    placeRepository.findDetailsById.mockResolvedValue({
      id: mockObjectId(),
      deleted: true,
    });

    await expect(
      useCase.execute({ placeId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PLACE_NOT_FOUND,
    });
  });
});
