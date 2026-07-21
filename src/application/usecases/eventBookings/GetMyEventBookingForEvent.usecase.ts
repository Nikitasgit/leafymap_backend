import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { MyEventBookingReadModel } from "@src/domain/read-models/eventBooking.read-models";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetMyEventBookingForEventInput } from "@src/application/dtos/eventBookings/getMyEventBookingForEvent.dto";

class GetMyEventBookingForEventUseCase {
  constructor(
    private readonly eventBookingRepository: IEventBookingRepository
  ) {}

  async execute(
    params: GetMyEventBookingForEventInput
  ): Promise<MyEventBookingReadModel | null> {
    return this.eventBookingRepository.findConfirmedByEventAndUser(
      EventId.from(params.eventId),
      UserId.from(params.userId)
    );
  }
}

export default GetMyEventBookingForEventUseCase;
