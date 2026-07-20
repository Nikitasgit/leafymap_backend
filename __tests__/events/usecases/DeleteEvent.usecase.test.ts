jest.mock("@src/shared/logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { Types } from "mongoose";
import DeleteEventUseCase from "@src/application/usecases/events/DeleteEvent.usecase";
import { Event } from "@src/domain/entities/Event.entity";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  EventCategoryId,
  EventId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";
import { ICascadeDeleter } from "@src/domain/interfaces/ICascadeDeleter";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("DeleteEventUseCase", () => {
  let eventRepository: jest.Mocked<IEventRepository>;
  let cascadeDeleter: jest.Mocked<ICascadeDeleter>;
  let useCase: DeleteEventUseCase;

  const futureStart = new Date();
  futureStart.setDate(futureStart.getDate() + 10);
  const futureEnd = new Date();
  futureEnd.setDate(futureEnd.getDate() + 11);

  const buildEvent = (ownerId: string) =>
    Event.reconstitute({
      id: EventId.from(mockObjectId()),
      name: "Yoga session",
      description: "A calm yoga class",
      ownerId: UserId.from(ownerId),
      categoryId: EventCategoryId.from(mockObjectId()),
      schedule: [{ startDate: futureStart, endDate: futureEnd }],
      dateRange: { firstDate: futureStart, latestDate: futureEnd },
      status: "available",
      lifecycleStatus: "upcoming",
      placeId: PlaceId.from(mockObjectId()),
      location: null,
      online: false,
      rating: 0,
      isBookable: false,
      capacity: null,
      maxSeatsPerBooking: 1,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    eventRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IEventRepository>;
    cascadeDeleter = {
      deleteEvents: jest.fn(),
      deletePlace: jest.fn(),
      deleteImagesWithComments: jest.fn(),
    };
    useCase = new DeleteEventUseCase(eventRepository, cascadeDeleter);
  });

  it("deletes an owned event via cascade", async () => {
    const ownerId = mockObjectId();
    const event = buildEvent(ownerId);
    eventRepository.findById.mockResolvedValue(event);

    await useCase.execute({
      eventId: event.id!.toString(),
      actorId: ownerId,
    });

    expect(cascadeDeleter.deleteEvents).toHaveBeenCalledWith([
      event.id!.toString(),
    ]);
  });

  it("forbids delete by non-owner", async () => {
    const event = buildEvent(mockObjectId());
    eventRepository.findById.mockResolvedValue(event);

    await expect(
      useCase.execute({
        eventId: event.id!.toString(),
        actorId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FORBIDDEN,
    });

    expect(cascadeDeleter.deleteEvents).not.toHaveBeenCalled();
  });
});
