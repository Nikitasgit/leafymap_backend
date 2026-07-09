import { Types } from "mongoose";
import CreateEventBookingAction from "@/actions/eventBookings/CreateEventBooking.action";
import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import {
  buildEvent,
  createMockRepository,
  mockObjectId,
} from "../../helpers/mockRepositories";

describe("CreateEventBookingAction", () => {
  let eventBookingRepository: jest.Mocked<IEventBookingRepository>;
  let eventRepository: jest.Mocked<IEventRepository>;
  let action: CreateEventBookingAction;

  beforeEach(() => {
    eventBookingRepository =
      createMockRepository<IEventBookingRepository>("sumConfirmedSeats");
    eventRepository = createMockRepository<IEventRepository>(
      "aggregate",
      "updateMany"
    );
    action = new CreateEventBookingAction(eventBookingRepository, eventRepository);
  });

  it("creates a confirmed booking and returns its id", async () => {
    const bookingId = new Types.ObjectId();
    const eventId = mockObjectId();
    const userId = mockObjectId();

    eventRepository.findById.mockResolvedValue(buildEvent() as never);
    eventBookingRepository.findOne.mockResolvedValue(null);
    eventBookingRepository.sumConfirmedSeats.mockResolvedValue(0);
    eventBookingRepository.create.mockResolvedValue(bookingId);

    const result = await action.execute({ eventId, userId, seats: 2 });

    expect(result).toEqual({ _id: bookingId.toString() });
    expect(eventBookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ seats: 2, status: "confirmed" })
    );
  });

  it("rejects when the event does not exist", async () => {
    eventRepository.findById.mockResolvedValue(null);

    await expect(
      action.execute({ eventId: mockObjectId(), userId: mockObjectId(), seats: 1 })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_NOT_FOUND,
      statusCode: 404,
    });

    expect(eventBookingRepository.create).not.toHaveBeenCalled();
  });

  it("rejects when the user already has a confirmed booking", async () => {
    eventRepository.findById.mockResolvedValue(buildEvent() as never);
    eventBookingRepository.findOne.mockResolvedValue({
      _id: new Types.ObjectId(),
    } as never);

    await expect(
      action.execute({ eventId: mockObjectId(), userId: mockObjectId(), seats: 1 })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_ALREADY_EXISTS,
      statusCode: 409,
    });
  });

  it("rejects when the event does not have enough remaining seats", async () => {
    eventRepository.findById.mockResolvedValue(
      buildEvent({ capacity: 10, maxSeatsPerBooking: 4 }) as never
    );
    eventBookingRepository.findOne.mockResolvedValue(null);
    eventBookingRepository.sumConfirmedSeats.mockResolvedValue(8);

    await expect(
      action.execute({ eventId: mockObjectId(), userId: mockObjectId(), seats: 3 })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_BOOKING_NOT_ENOUGH_SEATS,
      statusCode: 409,
    });

    expect(eventBookingRepository.create).not.toHaveBeenCalled();
  });
});
