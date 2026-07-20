import { Types } from "mongoose";
import CreateEventBookingUseCase from "@src/application/usecases/eventBookings/CreateEventBooking.usecase";
import { Event } from "@src/domain/entities/Event.entity";
import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  EventBookingId,
  EventCategoryId,
  EventId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

const createBookableEvent = (params: {
  ownerId: string;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
  lifecycleStatus?: "upcoming" | "ongoing" | "completed" | "unvalid";
  isBookable?: boolean;
}): Event => {
  const futureStart = new Date();
  futureStart.setDate(futureStart.getDate() + 10);
  const futureEnd = new Date();
  futureEnd.setDate(futureEnd.getDate() + 11);

  return Event.reconstitute({
    id: EventId.from(mockObjectId()),
    name: "Bookable event",
    description: "Test",
    ownerId: UserId.from(params.ownerId),
    categoryId: EventCategoryId.from(mockObjectId()),
    schedule: [{ startDate: futureStart, endDate: futureEnd }],
    dateRange: { firstDate: futureStart, latestDate: futureEnd },
    status: "available",
    lifecycleStatus: params.lifecycleStatus ?? "upcoming",
    placeId: PlaceId.from(mockObjectId()),
    location: null,
    online: false,
    rating: 0,
    isBookable: params.isBookable ?? true,
    capacity: params.capacity ?? 10,
    maxSeatsPerBooking: params.maxSeatsPerBooking ?? 2,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

describe("CreateEventBookingUseCase", () => {
  let eventBookingRepository: jest.Mocked<IEventBookingRepository>;
  let eventRepository: jest.Mocked<IEventRepository>;
  let useCase: CreateEventBookingUseCase;

  beforeEach(() => {
    eventBookingRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      deleteManyByEventIds: jest.fn(),
      deleteManyByUserId: jest.fn(),
      findConfirmedByEventAndUser: jest.fn(),
      sumConfirmedSeats: jest.fn(),
      findConfirmedByEvent: jest.fn(),
      findConfirmedByUser: jest.fn(),
    };
    eventRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IEventRepository>;
    useCase = new CreateEventBookingUseCase(
      eventBookingRepository,
      eventRepository
    );
  });

  it("creates a booking when seats are available", async () => {
    const ownerId = mockObjectId();
    const userId = mockObjectId();
    const event = createBookableEvent({ ownerId });
    const bookingId = mockObjectId();

    eventRepository.findById.mockResolvedValue(event);
    eventBookingRepository.findConfirmedByEventAndUser.mockResolvedValue(null);
    eventBookingRepository.sumConfirmedSeats.mockResolvedValue(0);
    eventBookingRepository.save.mockResolvedValue(
      EventBookingId.from(bookingId)
    );

    const result = await useCase.execute({
      eventId: event.id!.toString(),
      userId,
      seats: 2,
    });

    expect(result).toEqual({ id: bookingId });
    expect(eventBookingRepository.save).toHaveBeenCalled();
  });

  it("rejects booking the own event", async () => {
    const ownerId = mockObjectId();
    const event = createBookableEvent({ ownerId });
    eventRepository.findById.mockResolvedValue(event);

    await expect(
      useCase.execute({
        eventId: event.id!.toString(),
        userId: ownerId,
        seats: 1,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_OWN_EVENT,
    });
  });

  it("rejects when not enough seats remain", async () => {
    const event = createBookableEvent({
      ownerId: mockObjectId(),
      capacity: 3,
    });
    eventRepository.findById.mockResolvedValue(event);
    eventBookingRepository.findConfirmedByEventAndUser.mockResolvedValue(null);
    eventBookingRepository.sumConfirmedSeats.mockResolvedValue(2);

    await expect(
      useCase.execute({
        eventId: event.id!.toString(),
        userId: mockObjectId(),
        seats: 2,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_NOT_ENOUGH_SEATS,
    });
  });
});
