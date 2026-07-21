import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { EventBookingListItemReadModel } from "@src/domain/read-models/eventBooking.read-models";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetMyEventBookingsInput } from "@src/application/dtos/eventBookings/getMyEventBookings.dto";

class GetMyEventBookingsUseCase {
  constructor(
    private readonly eventBookingRepository: IEventBookingRepository
  ) {}

  async execute(
    params: GetMyEventBookingsInput
  ): Promise<EventBookingListItemReadModel[]> {
    return this.eventBookingRepository.findConfirmedByUser(
      UserId.from(params.userId)
    );
  }
}

export default GetMyEventBookingsUseCase;
