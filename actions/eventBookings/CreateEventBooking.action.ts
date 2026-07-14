import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import {
  ConflictError,
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/utils/errors";
import { toId } from "@/utils/mongoose";

export interface CreateEventBookingDTO {
  eventId: string;
  userId: string;
  seats: number;
}

export interface ICreateEventBookingAction {
  execute(params: CreateEventBookingDTO): Promise<{ _id: string }>;
}

class CreateEventBookingAction implements ICreateEventBookingAction {
  constructor(
    private eventBookingRepository: IEventBookingRepository,
    private eventRepository: IEventRepository
  ) {}

  async execute({
    eventId,
    userId,
    seats,
  }: CreateEventBookingDTO): Promise<{ _id: string }> {
    const event = await this.eventRepository.findById(eventId, [
      "_id",
      "user",
      "deleted",
      "isBookable",
      "capacity",
      "maxSeatsPerBooking",
      "lifecycleStatus",
    ]);

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

    const eventOwnerId = toId(event.user);
    if (eventOwnerId === userId) {
      throw new ForbiddenError(
        ERROR_CODES.EVENT_BOOKING_OWN_EVENT,
        "Vous ne pouvez pas réserver votre propre évènement"
      );
    }

    const existingBooking = await this.eventBookingRepository.findOne({
      event: eventId as any,
      user: userId as any,
      status: "confirmed",
    });

    if (existingBooking) {
      throw new ConflictError(
        ERROR_CODES.EVENT_BOOKING_ALREADY_EXISTS,
        "Vous avez déjà une réservation pour cet évènement"
      );
    }

    if (seats > event.maxSeatsPerBooking) {
      throw new ValidationError(
        { seats: `Maximum ${event.maxSeatsPerBooking} place(s)` },
        ERROR_CODES.EVENT_BOOKING_TOO_MANY_SEATS,
        `Vous ne pouvez pas réserver plus de ${event.maxSeatsPerBooking} place(s)`
      );
    }

    if (typeof event.capacity === "number") {
      const bookedSeats = await this.eventBookingRepository.sumConfirmedSeats(
        eventId
      );
      if (bookedSeats + seats > event.capacity) {
        throw new ConflictError(
          ERROR_CODES.EVENT_BOOKING_NOT_ENOUGH_SEATS,
          "Il ne reste plus assez de places disponibles"
        );
      }
    }

    const bookingId = await this.eventBookingRepository.create({
      event: eventId as any,
      user: userId as any,
      seats,
      status: "confirmed",
    });

    return { _id: bookingId.toString() };
  }
}

export default CreateEventBookingAction;
