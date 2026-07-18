import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { EventId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

export interface IGetEventByIdUseCase {
  execute(params: { eventId: string }): Promise<Record<string, unknown>>;
}

class GetEventByIdUseCase implements IGetEventByIdUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly eventBookingRepository: IEventBookingRepository
  ) {}

  async execute(params: {
    eventId: string;
  }): Promise<Record<string, unknown>> {
    const eventId = EventId.from(params.eventId);
    const event = await this.eventRepository.findDetailById(eventId);

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
          ? Math.max((event.capacity as number) - bookedSeats, 0)
          : null;
    }

    const schedule = Array.isArray(event.schedule)
      ? (event.schedule as Array<Record<string, unknown>>).map((period) => ({
          ...period,
          timeSlots: Array.isArray(period.timeSlots)
            ? (period.timeSlots as Array<Record<string, unknown>>).map(
                (slot) => ({
                  ...slot,
                  collaborators: Array.isArray(slot.collaborators)
                    ? (
                        slot.collaborators as Array<
                          string | Record<string, unknown>
                        >
                      ).map((collaborator) => {
                        if (
                          typeof collaborator === "object" &&
                          collaborator !== null &&
                          "username" in collaborator
                        ) {
                          const image = collaborator.image as
                            | { urls?: { thumbnail?: string | null } }
                            | undefined;
                          return {
                            name: collaborator.username,
                            image: image?.urls?.thumbnail || null,
                            _id: collaborator._id,
                          };
                        }
                        return collaborator;
                      })
                    : slot.collaborators,
                })
              )
            : period.timeSlots,
        }))
      : event.schedule;

    return {
      ...event,
      bookedSeats,
      remainingSeats,
      schedule,
    };
  }
}

export default GetEventByIdUseCase;
