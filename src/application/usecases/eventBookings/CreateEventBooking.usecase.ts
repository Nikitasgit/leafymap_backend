import { EventBooking } from "@src/domain/entities/EventBooking.entity";
import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ConflictError,
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@src/shared/errors";
import {
  CreateEventBookingInput,
  CreateEventBookingOutput,
} from "@src/application/dtos/eventBookings/createEventBooking.dto";

class CreateEventBookingUseCase {
  constructor(
    private readonly eventBookingRepository: IEventBookingRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(
    params: CreateEventBookingInput
  ): Promise<CreateEventBookingOutput> {
    const eventId = EventId.from(params.eventId);
    const userId = UserId.from(params.userId);

    const event = await this.eventRepository.findById(eventId);
    if (!event || event.deleted) {
      throw new NotFoundError(ERROR_CODES.EVENT_NOT_FOUND, "Event not found");
    }

    if (!event.isBookable) {
      throw new ForbiddenError(
        ERROR_CODES.EVENT_NOT_BOOKABLE,
        "Cet évènement n'est pas réservable"
      );
    }

    if (event.lifecycleStatus !== "upcoming") {
      throw new ForbiddenError(
        ERROR_CODES.EVENT_BOOKING_CLOSED,
        "Cet évènement a déjà commencé ou est terminé, la réservation n'est plus possible"
      );
    }

    if (event.belongsTo(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.EVENT_BOOKING_OWN_EVENT,
        "Vous ne pouvez pas réserver votre propre évènement"
      );
    }

    const existingBooking =
      await this.eventBookingRepository.findConfirmedByEventAndUser(
        eventId,
        userId
      );

    if (existingBooking) {
      throw new ConflictError(
        ERROR_CODES.EVENT_BOOKING_ALREADY_EXISTS,
        "Vous avez déjà une réservation pour cet évènement"
      );
    }

    if (params.seats > event.maxSeatsPerBooking) {
      throw new ValidationError(
        { seats: `Maximum ${event.maxSeatsPerBooking} place(s)` },
        ERROR_CODES.EVENT_BOOKING_TOO_MANY_SEATS,
        `Vous ne pouvez pas réserver plus de ${event.maxSeatsPerBooking} place(s)`
      );
    }

    if (typeof event.capacity === "number") {
      const bookedSeats =
        await this.eventBookingRepository.sumConfirmedSeats(eventId);
      if (bookedSeats + params.seats > event.capacity) {
        throw new ConflictError(
          ERROR_CODES.EVENT_BOOKING_NOT_ENOUGH_SEATS,
          "Il ne reste plus assez de places disponibles"
        );
      }
    }

    const booking = EventBooking.create({
      eventId,
      userId,
      seats: params.seats,
    });
    const id = await this.eventBookingRepository.save(booking);
    return { id };
  }
}

export default CreateEventBookingUseCase;
