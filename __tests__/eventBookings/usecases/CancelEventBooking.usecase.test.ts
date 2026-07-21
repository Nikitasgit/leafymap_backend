import { Types } from "mongoose";
import CancelEventBookingUseCase from "@src/application/usecases/eventBookings/CancelEventBooking.usecase";
import { Event } from "@src/domain/entities/Event.entity";
import { EventBooking } from "@src/domain/entities/EventBooking.entity";
import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventNotifier } from "@src/domain/interfaces/IEventNotifier";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  EventBookingId,
  EventCategoryId,
  EventId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const objectId = (): string => new Types.ObjectId().toString();

const createBooking = (
  eventId: EventId,
  userId: UserId,
  status: "confirmed" | "cancelled" = "confirmed"
): EventBooking =>
  EventBooking.reconstitute({
    id: EventBookingId.from(objectId()),
    eventId,
    userId,
    seats: 2,
    status,
    cancelledAt: status === "cancelled" ? new Date() : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const createEvent = (
  id: EventId,
  ownerId: UserId,
  lifecycleStatus: "upcoming" | "ongoing" | "completed" = "upcoming"
): Event => {
  const start = new Date("2027-01-01");
  return Event.reconstitute({
    id,
    name: "Test event",
    description: "Description",
    ownerId,
    categoryId: EventCategoryId.from(objectId()),
    schedule: [{ startDate: start, endDate: start }],
    dateRange: { firstDate: start, latestDate: start },
    status: "available",
    lifecycleStatus,
    placeId: PlaceId.from(objectId()),
    online: false,
    rating: 0,
    isBookable: true,
    capacity: 20,
    maxSeatsPerBooking: 4,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

describe("CancelEventBookingUseCase", () => {
  let bookingRepository: jest.Mocked<IEventBookingRepository>;
  let eventRepository: jest.Mocked<Pick<IEventRepository, "findById">>;
  let notifier: jest.Mocked<IEventNotifier>;
  let useCase: CancelEventBookingUseCase;

  beforeEach(() => {
    bookingRepository = {
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
    eventRepository = { findById: jest.fn() };
    notifier = { notifyBookingCancelled: jest.fn() };
    useCase = new CancelEventBookingUseCase(
      bookingRepository,
      eventRepository as unknown as IEventRepository,
      notifier
    );
  });

  it("lets the booking owner cancel without notification", async () => {
    const userId = UserId.from(objectId());
    const eventId = EventId.from(objectId());
    const booking = createBooking(eventId, userId);
    bookingRepository.findById.mockResolvedValue(booking);
    eventRepository.findById.mockResolvedValue(
      createEvent(eventId, UserId.from(objectId()))
    );

    await useCase.execute({
      bookingId: booking.id!,
      requesterId: userId,
    });

    expect(bookingRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" })
    );
    expect(notifier.notifyBookingCancelled).not.toHaveBeenCalled();
  });

  it("lets the event owner cancel and notifies the attendee", async () => {
    const attendeeId = UserId.from(objectId());
    const ownerId = UserId.from(objectId());
    const eventId = EventId.from(objectId());
    const booking = createBooking(eventId, attendeeId);
    bookingRepository.findById.mockResolvedValue(booking);
    eventRepository.findById.mockResolvedValue(
      createEvent(eventId, ownerId)
    );

    await useCase.execute({
      bookingId: booking.id!,
      requesterId: ownerId,
    });

    expect(notifier.notifyBookingCancelled).toHaveBeenCalledWith({
      senderId: ownerId,
      receiverId: attendeeId,
      eventId,
    });
  });

  it("is idempotent for an already cancelled booking", async () => {
    const booking = createBooking(
      EventId.from(objectId()),
      UserId.from(objectId()),
      "cancelled"
    );
    bookingRepository.findById.mockResolvedValue(booking);

    await useCase.execute({
      bookingId: booking.id!,
      requesterId: booking.userId,
    });

    expect(eventRepository.findById).not.toHaveBeenCalled();
    expect(bookingRepository.update).not.toHaveBeenCalled();
  });

  it("rejects a requester who owns neither booking nor event", async () => {
    const eventId = EventId.from(objectId());
    const booking = createBooking(eventId, UserId.from(objectId()));
    bookingRepository.findById.mockResolvedValue(booking);
    eventRepository.findById.mockResolvedValue(
      createEvent(eventId, UserId.from(objectId()))
    );

    await expect(
      useCase.execute({
        bookingId: booking.id!,
        requesterId: objectId(),
      })
    ).rejects.toMatchObject({ code: ERROR_CODES.FORBIDDEN });
  });

  it("closes cancellation after the event starts", async () => {
    const userId = UserId.from(objectId());
    const eventId = EventId.from(objectId());
    const booking = createBooking(eventId, userId);
    bookingRepository.findById.mockResolvedValue(booking);
    eventRepository.findById.mockResolvedValue(
      createEvent(eventId, UserId.from(objectId()), "ongoing")
    );

    await expect(
      useCase.execute({
        bookingId: booking.id!,
        requesterId: userId,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_CANCEL_CLOSED,
    });
    expect(bookingRepository.update).not.toHaveBeenCalled();
  });
});
