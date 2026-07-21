import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventDetailsReadModel } from "@src/domain/read-models/event.read-models";
import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { EventId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";
import { GetEventByIdInput } from "@src/application/dtos/events/getEventById.dto";

class GetEventByIdUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly eventBookingRepository: IEventBookingRepository
  ) {}

  async execute(params: GetEventByIdInput): Promise<EventDetailsReadModel> {
    const eventId = EventId.from(params.eventId);
    const event = await this.eventRepository.findDetailsById(eventId);

    if (!event || event.deleted) {
      throw new NotFoundError(ERROR_CODES.EVENT_NOT_FOUND, "Event not found");
    }

    let bookedSeats: number | undefined;
    let remainingSeats: number | null | undefined;

    if (event.isBookable) {
      bookedSeats = await this.eventBookingRepository.sumConfirmedSeats(
        eventId
      );
      remainingSeats =
        typeof event.capacity === "number"
          ? Math.max(event.capacity - bookedSeats, 0)
          : null;
    }

    return {
      ...event,
      bookedSeats,
      remainingSeats,
    };
  }
}

export default GetEventByIdUseCase;
