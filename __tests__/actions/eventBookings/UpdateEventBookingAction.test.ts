import { Types } from "mongoose";
import UpdateEventBookingAction from "@/actions/eventBookings/UpdateEventBooking.action";
import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import {
  buildEvent,
  createMockRepository,
  mockObjectId,
} from "../../helpers/mockRepositories";

jest.mock("@/services/notificationService", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    createNotification: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe("UpdateEventBookingAction", () => {
  let eventBookingRepository: jest.Mocked<IEventBookingRepository>;
  let eventRepository: jest.Mocked<IEventRepository>;
  let action: UpdateEventBookingAction;

  beforeEach(() => {
    eventBookingRepository =
      createMockRepository<IEventBookingRepository>("sumConfirmedSeats");
    eventRepository = createMockRepository<IEventRepository>("aggregate", "updateMany");
    action = new UpdateEventBookingAction(
      eventBookingRepository,
      eventRepository,
      new (jest.requireMock("@/services/notificationService").default)()
    );
  });

  it("updates seats on a confirmed booking", async () => {
    const bookingId = mockObjectId();
    const eventId = mockObjectId();
    const userId = mockObjectId();

    eventBookingRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(bookingId),
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(userId),
      status: "confirmed",
    } as never);
    eventRepository.findById.mockResolvedValue(
      buildEvent({
        _id: new Types.ObjectId(eventId),
        capacity: 10,
        maxSeatsPerBooking: 4,
        lifecycleStatus: "upcoming",
      }) as never
    );
    eventBookingRepository.sumConfirmedSeats.mockResolvedValue(2);

    await action.execute({ bookingId, requesterId: userId, seats: 3 });

    expect(eventBookingRepository.updateOne).toHaveBeenCalledWith(bookingId, {
      seats: 3,
    });
  });

  it("rejects when the booking is not found or not confirmed", async () => {
    eventBookingRepository.findById.mockResolvedValue(null);

    await expect(
      action.execute({
        bookingId: mockObjectId(),
        requesterId: mockObjectId(),
        seats: 2,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_NOT_FOUND,
      statusCode: 404,
    });

    expect(eventBookingRepository.updateOne).not.toHaveBeenCalled();
  });

  it("rejects when too many seats are requested", async () => {
    const bookingId = mockObjectId();
    const eventId = mockObjectId();

    eventBookingRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(bookingId),
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(),
      status: "confirmed",
    } as never);
    eventRepository.findById.mockResolvedValue(
      buildEvent({
        _id: new Types.ObjectId(eventId),
        maxSeatsPerBooking: 2,
        lifecycleStatus: "upcoming",
      }) as never
    );

    await expect(
      action.execute({
        bookingId,
        requesterId: mockObjectId(),
        seats: 3,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_TOO_MANY_SEATS,
      statusCode: 400,
    });

    expect(eventBookingRepository.updateOne).not.toHaveBeenCalled();
  });

  it("rejects when there are not enough remaining seats", async () => {
    const bookingId = mockObjectId();
    const eventId = mockObjectId();

    eventBookingRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(bookingId),
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(),
      status: "confirmed",
    } as never);
    eventRepository.findById.mockResolvedValue(
      buildEvent({
        _id: new Types.ObjectId(eventId),
        capacity: 10,
        maxSeatsPerBooking: 4,
        lifecycleStatus: "upcoming",
      }) as never
    );
    eventBookingRepository.sumConfirmedSeats.mockResolvedValue(9);

    await expect(
      action.execute({
        bookingId,
        requesterId: mockObjectId(),
        seats: 2,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_NOT_ENOUGH_SEATS,
      statusCode: 409,
    });

    expect(eventBookingRepository.updateOne).not.toHaveBeenCalled();
  });
});
