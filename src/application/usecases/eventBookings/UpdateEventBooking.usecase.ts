import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  EventBookingId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import {
  ConflictError,
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@src/shared/errors";
import { UpdateEventBookingInput } from "@src/application/dtos/eventBookings/updateEventBooking.dto";

class UpdateEventBookingUseCase {
  constructor(
    private readonly eventBookingRepository: IEventBookingRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(params: UpdateEventBookingInput): Promise<void> {
    const bookingId = EventBookingId.from(params.bookingId);
    const requesterId = UserId.from(params.requesterId);

    const booking = await this.eventBookingRepository.findById(bookingId);
    if (!booking || booking.status !== "confirmed") {
      throw new NotFoundError(
        ERROR_CODES.EVENT_BOOKING_NOT_FOUND,
        "Réservation non trouvée"
      );
    }

    const event = await this.eventRepository.findById(booking.eventId);
    if (!event) {
      throw new NotFoundError(ERROR_CODES.EVENT_NOT_FOUND, "Event not found");
    }

    const isBookingOwner = booking.belongsTo(requesterId);
    const isEventOwner = event.belongsTo(requesterId);
    if (!isBookingOwner && !isEventOwner) {
      throw new ForbiddenError(
        ERROR_CODES.FORBIDDEN,
        "You don't have permission to update this booking"
      );
    }

    if (event.lifecycleStatus !== "upcoming") {
      throw new ForbiddenError(
        ERROR_CODES.EVENT_BOOKING_UPDATE_CLOSED,
        "Cet évènement a déjà commencé ou est terminé, la réservation ne peut plus être modifiée"
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
      const bookedSeats = await this.eventBookingRepository.sumConfirmedSeats(
        booking.eventId,
        bookingId
      );
      if (bookedSeats + params.seats > event.capacity) {
        throw new ConflictError(
          ERROR_CODES.EVENT_BOOKING_NOT_ENOUGH_SEATS,
          "Il ne reste plus assez de places disponibles"
        );
      }
    }

    const updated = booking.updateSeats(params.seats);
    await this.eventBookingRepository.update(updated);
  }
}

export default UpdateEventBookingUseCase;
