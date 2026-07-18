import { Types } from "mongoose";
import UpdateEventBookingUseCase from "@src/application/usecases/eventBookings/UpdateEventBooking.usecase";
import { Event } from "@src/domain/entities/Event.entity";
import { EventBooking } from "@src/domain/entities/EventBooking.entity";
import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  EventBookingId,
  EventCategoryId,
  EventId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

const createBookableEvent = (params: {
  ownerId: string;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
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
    lifecycleStatus: "upcoming",
    placeId: PlaceId.from(mockObjectId()),
    location: null,
    online: false,
    rating: 0,
    isBookable: true,
    capacity: params.capacity ?? 10,
    maxSeatsPerBooking: params.maxSeatsPerBooking ?? 4,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

describe("UpdateEventBookingUseCase", () => {
  let eventBookingRepository: jest.Mocked<IEventBookingRepository>;
  let eventRepository: jest.Mocked<IEventRepository>;
  let useCase: UpdateEventBookingUseCase;

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
    useCase = new UpdateEventBookingUseCase(
      eventBookingRepository,
      eventRepository
    );
  });

  it("updates seats when the event owner changes a booking without notifying cancel", async () => {
    const ownerId = mockObjectId();
    const bookerId = mockObjectId();
    const event = createBookableEvent({ ownerId });
    const booking = EventBooking.reconstitute({
      id: EventBookingId.from(mockObjectId()),
      eventId: event.id!,
      userId: UserId.from(bookerId),
      seats: 1,
      status: "confirmed",
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    eventBookingRepository.findById.mockResolvedValue(booking);
    eventRepository.findById.mockResolvedValue(event);
    eventBookingRepository.sumConfirmedSeats.mockResolvedValue(1);
    eventBookingRepository.update.mockResolvedValue(undefined);

    await useCase.execute({
      bookingId: booking.id!.toString(),
      requesterId: ownerId,
      seats: 2,
    });

    expect(eventBookingRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ seats: 2, status: "confirmed" })
    );
  });
});
