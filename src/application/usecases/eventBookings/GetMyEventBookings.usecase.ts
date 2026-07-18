import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IGetMyEventBookingsUseCase {
  execute(params: { userId: string }): Promise<Record<string, unknown>[]>;
}

class GetMyEventBookingsUseCase implements IGetMyEventBookingsUseCase {
  constructor(
    private readonly eventBookingRepository: IEventBookingRepository
  ) {}

  async execute(params: {
    userId: string;
  }): Promise<Record<string, unknown>[]> {
    return this.eventBookingRepository.findConfirmedByUser(
      UserId.from(params.userId)
    );
  }
}

export default GetMyEventBookingsUseCase;
