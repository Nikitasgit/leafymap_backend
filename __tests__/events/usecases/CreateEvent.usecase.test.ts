import { Types } from "mongoose";
import CreateEventUseCase from "@src/application/usecases/events/CreateEvent.usecase";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IPlaceOwnershipChecker } from "@src/domain/interfaces/IPlaceOwnershipChecker";
import { EventId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

const createMockEventRepository = (): jest.Mocked<IEventRepository> =>
  ({
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findDetailsById: jest.fn(),
    findList: jest.fn(),
    findInView: jest.fn(),
    findAllForLifecycleUpdate: jest.fn(),
    updateLifecycleFields: jest.fn(),
    updateRating: jest.fn(),
    softDelete: jest.fn(),
    findIdsByPlace: jest.fn(),
    findIdsByOwner: jest.fn(),
    deleteManyByIds: jest.fn(),
    removeCollaborator: jest.fn(),
    findScheduleById: jest.fn(),
    updateSchedule: jest.fn(),
    findByAuthorAdmin: jest.fn(),
    findByPlaceInDateRange: jest.fn(),
    findOwnerId: jest.fn(),
  }) as jest.Mocked<IEventRepository>;

describe("CreateEventUseCase", () => {
  let eventRepository: jest.Mocked<IEventRepository>;
  let placeOwnershipChecker: jest.Mocked<IPlaceOwnershipChecker>;
  let useCase: CreateEventUseCase;

  const futureStart = new Date();
  futureStart.setDate(futureStart.getDate() + 10);
  const futureEnd = new Date();
  futureEnd.setDate(futureEnd.getDate() + 11);

  beforeEach(() => {
    eventRepository = createMockEventRepository();
    placeOwnershipChecker = {
      assertOwnedBy: jest.fn(),
    };
    useCase = new CreateEventUseCase(eventRepository, placeOwnershipChecker);
  });

  it("creates an event and checks place ownership", async () => {
    const ownerId = mockObjectId();
    const placeId = mockObjectId();
    const eventId = mockObjectId();
    eventRepository.save.mockResolvedValue(EventId.from(eventId));

    const result = await useCase.execute({
      name: "Yoga session",
      description: "A calm yoga class",
      ownerId,
      categoryId: mockObjectId(),
      schedule: [
        {
          startDate: futureStart,
          endDate: futureEnd,
          timeSlots: [],
        },
      ],
      placeId,
    });

    expect(result).toEqual({ id: eventId });
    expect(placeOwnershipChecker.assertOwnedBy).toHaveBeenCalled();
    expect(eventRepository.save).toHaveBeenCalled();
  });

  it("propagates place ownership errors", async () => {
    placeOwnershipChecker.assertOwnedBy.mockRejectedValue(
      Object.assign(new Error("forbidden"), {
        code: ERROR_CODES.EVENT_PLACE_FORBIDDEN,
      })
    );

    await expect(
      useCase.execute({
        name: "Yoga session",
        description: "A calm yoga class",
        ownerId: mockObjectId(),
        categoryId: mockObjectId(),
        schedule: [{ startDate: futureStart, endDate: futureEnd }],
        placeId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_PLACE_FORBIDDEN,
    });

    expect(eventRepository.save).not.toHaveBeenCalled();
  });
});
