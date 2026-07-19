import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetMyEventBookingsInput } from "@src/application/dtos/eventBookings/getMyEventBookings.dto";

class GetMyEventBookingsUseCase {
  constructor(
    private readonly eventBookingRepository: IEventBookingRepository
  ) {}

  async execute(
    params: GetMyEventBookingsInput
  ): Promise<Record<string, unknown>[]> {
    return this.eventBookingRepository.findConfirmedByUser(
      UserId.from(params.userId)
    );
  }
}

export default GetMyEventBookingsUseCase;
