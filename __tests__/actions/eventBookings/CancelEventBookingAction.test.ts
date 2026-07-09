import { Types } from "mongoose";
import CancelEventBookingAction from "@/actions/eventBookings/CancelEventBooking.action";
import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import {
  buildEvent,
  createMockRepository,
  mockObjectId,
} from "../../helpers/mockRepositories";

const mockCreateNotification = jest.fn().mockResolvedValue(undefined);

jest.mock("@/services/notificationService", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    createNotification: mockCreateNotification,
  })),
}));

describe("CancelEventBookingAction", () => {
  let eventBookingRepository: jest.Mocked<IEventBookingRepository>;
  let eventRepository: jest.Mocked<IEventRepository>;
  let action: CancelEventBookingAction;

  beforeEach(() => {
    mockCreateNotification.mockClear();
    eventBookingRepository = createMockRepository<IEventBookingRepository>();
    eventRepository = createMockRepository<IEventRepository>("aggregate", "updateMany");
    action = new CancelEventBookingAction(
      eventBookingRepository,
      eventRepository,
      new (jest.requireMock("@/services/notificationService").default)()
    );
  });

  it("cancels a booking on an upcoming event", async () => {
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
      buildEvent({ _id: new Types.ObjectId(eventId), lifecycleStatus: "upcoming" }) as never
    );

    await action.execute({ bookingId, requesterId: userId });

    expect(eventBookingRepository.updateOne).toHaveBeenCalledWith(
      bookingId,
      expect.objectContaining({ status: "cancelled", cancelledAt: expect.any(Date) })
    );
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it("rejects when the booking is not found", async () => {
    eventBookingRepository.findById.mockResolvedValue(null);

    await expect(
      action.execute({ bookingId: mockObjectId(), requesterId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_NOT_FOUND,
      statusCode: 404,
    });

    expect(eventBookingRepository.updateOne).not.toHaveBeenCalled();
  });

  it("rejects when the event has already started", async () => {
    const bookingId = mockObjectId();
    const eventId = mockObjectId();

    eventBookingRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(bookingId),
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(),
      status: "confirmed",
    } as never);
    eventRepository.findById.mockResolvedValue(
      buildEvent({ _id: new Types.ObjectId(eventId), lifecycleStatus: "ongoing" }) as never
    );

    await expect(
      action.execute({ bookingId, requesterId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_CANCEL_CLOSED,
      statusCode: 403,
    });

    expect(eventBookingRepository.updateOne).not.toHaveBeenCalled();
  });
});
