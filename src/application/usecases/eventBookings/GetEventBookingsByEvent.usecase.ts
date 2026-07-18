import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

export interface IGetEventBookingsByEventUseCase {
  execute(params: {
    eventId: string;
    actorId: string;
  }): Promise<Record<string, unknown>[]>;
}

class GetEventBookingsByEventUseCase
  implements IGetEventBookingsByEventUseCase
{
  constructor(
    private readonly eventBookingRepository: IEventBookingRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(params: {
    eventId: string;
    actorId: string;
  }): Promise<Record<string, unknown>[]> {
    const eventId = EventId.from(params.eventId);
    const actorId = UserId.from(params.actorId);

    const event = await this.eventRepository.findById(eventId);
    if (!event || event.deleted) {
      throw new NotFoundError(ERROR_CODES.EVENT_NOT_FOUND, "Event not found");
    }

    if (!event.belongsTo(actorId)) {
      throw new ForbiddenError(
        ERROR_CODES.FORBIDDEN,
        "You don't have permission to view bookings for this event"
      );
    }

    return this.eventBookingRepository.findConfirmedByEvent(eventId);
  }
}

export default GetEventBookingsByEventUseCase;
