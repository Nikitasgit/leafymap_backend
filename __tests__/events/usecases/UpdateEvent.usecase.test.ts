import { Types } from "mongoose";
import UpdateEventUseCase from "@src/application/usecases/events/UpdateEvent.usecase";
import { Event } from "@src/domain/entities/Event.entity";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IPlaceOwnershipChecker } from "@src/domain/interfaces/IPlaceOwnershipChecker";
import {
  EventCategoryId,
  EventId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const objectId = (): string => new Types.ObjectId().toString();

const createEvent = (ownerId: UserId, deleted = false): Event => {
  const start = new Date("2027-01-01");
  return Event.reconstitute({
    id: EventId.from(objectId()),
    name: "Original event",
    description: "Original description",
    ownerId,
    categoryId: EventCategoryId.from(objectId()),
    schedule: [{ startDate: start, endDate: start }],
    dateRange: { firstDate: start, latestDate: start },
    status: "available",
    lifecycleStatus: "upcoming",
    placeId: PlaceId.from(objectId()),
    online: false,
    rating: 0,
    isBookable: false,
    capacity: null,
    maxSeatsPerBooking: 1,
    deleted,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

describe("UpdateEventUseCase", () => {
  let repository: jest.Mocked<Pick<IEventRepository, "findById" | "update">>;
  let ownershipChecker: jest.Mocked<IPlaceOwnershipChecker>;
  let useCase: UpdateEventUseCase;

  beforeEach(() => {
    repository = { findById: jest.fn(), update: jest.fn() };
    ownershipChecker = { assertOwnedBy: jest.fn() };
    useCase = new UpdateEventUseCase(
      repository as unknown as IEventRepository,
      ownershipChecker
    );
  });

  it("updates fields and recalculates lifecycle from schedule", async () => {
    const ownerId = UserId.from(objectId());
    const event = createEvent(ownerId);
    const placeId = objectId();
    const futureStart = new Date("2028-03-01");
    repository.findById.mockResolvedValue(event);

    await useCase.execute({
      eventId: event.id!,
      actorId: ownerId,
      name: "Updated event",
      placeId,
      schedule: [{ startDate: futureStart, endDate: futureStart }],
      isBookable: true,
      capacity: 12,
      maxSeatsPerBooking: 3,
    });

    expect(ownershipChecker.assertOwnedBy).toHaveBeenCalledWith(
      PlaceId.from(placeId),
      ownerId
    );
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Updated event",
        dateRange: { firstDate: futureStart, latestDate: futureStart },
        lifecycleStatus: "upcoming",
        capacity: 12,
      })
    );
  });

  it("supports removing a place when another location is supplied", async () => {
    const ownerId = UserId.from(objectId());
    const event = createEvent(ownerId);
    repository.findById.mockResolvedValue(event);
    const location = {
      type: "Point" as const,
      coordinates: [2.35, 48.85] as [number, number],
      label: "Paris",
      id: "paris",
    };

    await useCase.execute({
      eventId: event.id!,
      actorId: ownerId,
      placeId: null,
      location,
    });

    expect(ownershipChecker.assertOwnedBy).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ placeId: null, location })
    );
  });

  it("rejects missing or deleted events", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ eventId: objectId(), actorId: objectId() })
    ).rejects.toMatchObject({ code: ERROR_CODES.EVENT_NOT_FOUND });
  });

  it("rejects non-owners before checking a new place", async () => {
    const event = createEvent(UserId.from(objectId()));
    repository.findById.mockResolvedValue(event);

    await expect(
      useCase.execute({
        eventId: event.id!,
        actorId: objectId(),
        placeId: objectId(),
      })
    ).rejects.toMatchObject({ code: ERROR_CODES.FORBIDDEN });
    expect(ownershipChecker.assertOwnedBy).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });
});
