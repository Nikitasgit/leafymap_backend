import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetMyEventBookingForEventInput } from "@src/application/dtos/eventBookings/getMyEventBookingForEvent.dto";

class GetMyEventBookingForEventUseCase {
  constructor(
    private readonly eventBookingRepository: IEventBookingRepository
  ) {}

  async execute(
    params: GetMyEventBookingForEventInput
  ): Promise<Record<string, unknown> | null> {
    const booking =
      await this.eventBookingRepository.findConfirmedByEventAndUser(
        EventId.from(params.eventId),
        UserId.from(params.userId)
      );

    if (!booking || !booking.id) {
      return null;
    }

    return {
      _id: booking.id,
      event: booking.eventId,
      user: booking.userId,
      seats: booking.seats,
      status: booking.status,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}

export default GetMyEventBookingForEventUseCase;
