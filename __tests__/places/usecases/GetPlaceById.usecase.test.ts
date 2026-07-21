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

  afterEach(() => {
    jest.useRealTimers();
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

  it("enriches the current week schedule with typed event summaries", async () => {
    const placeId = mockObjectId();
    const monday = new Date("2026-07-20T12:00:00.000Z");
    jest.useFakeTimers().setSystemTime(monday);
    const day = { open: true, timeSlots: [] };
    placeRepository.findDetailsById.mockResolvedValue({
      id: placeId,
      defaultSchedule: {
        monday: day,
        tuesday: day,
        wednesday: day,
        thursday: day,
        friday: day,
        saturday: day,
        sunday: day,
      },
    });
    eventRepository.findByPlaceInDateRange.mockResolvedValue([
      {
        id: mockObjectId(),
        name: "Monday market",
        schedule: [{ startDate: monday, endDate: monday }],
        status: "available",
        deleted: false,
      },
    ]);

    const result = await useCase.execute({
      placeId,
      scheduleWithEvents: true,
    });

    expect(result.defaultSchedule?.monday.events).toEqual([
      expect.objectContaining({ name: "Monday market" }),
    ]);
    const [, rangeStart, rangeEnd] =
      eventRepository.findByPlaceInDateRange.mock.calls[0];
    expect(rangeStart).toEqual(expect.any(Date));
    expect(rangeStart.getDay()).toBe(1);
    expect(rangeStart.getHours()).toBe(0);
    expect(rangeEnd.getDay()).toBe(0);
    expect(rangeEnd.getHours()).toBe(23);
    expect(result.defaultSchedule?.tuesday.events).toEqual([]);
  });

  it("does not query events when the place has no default schedule", async () => {
    const placeId = mockObjectId();
    placeRepository.findDetailsById.mockResolvedValue({ id: placeId });

    await useCase.execute({ placeId, scheduleWithEvents: true });

    expect(eventRepository.findByPlaceInDateRange).not.toHaveBeenCalled();
  });
});
