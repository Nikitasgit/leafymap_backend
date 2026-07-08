import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";

export interface CreateEventBookingDTO {
  eventId: string;
  userId: string;
  seats: number;
}

export interface ICreateEventBookingAction {
  execute(params: CreateEventBookingDTO): Promise<{ _id: string }>;
}

const getOwnerId = (owner: unknown): string | undefined => {
  if (!owner) return undefined;
  if (typeof owner === "object" && "_id" in (owner as any)) {
    return (owner as any)._id.toString();
  }
  return owner.toString();
};

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
      throw new Error("Event not found");
    }

    if (!event.isBookable) {
      throw new Error("Cet évènement n'est pas réservable");
    }

    if (event.lifecycleStatus !== "upcoming") {
      throw new Error(
        "Cet évènement a déjà commencé ou est terminé, la réservation n'est plus possible"
      );
    }

    const eventOwnerId = getOwnerId(event.user);
    if (eventOwnerId === userId) {
      throw new Error("Vous ne pouvez pas réserver votre propre évènement");
    }

    const existingBooking = await this.eventBookingRepository.findOne({
      event: eventId as any,
      user: userId as any,
      status: "confirmed",
    });

    if (existingBooking) {
      throw new Error("Vous avez déjà une réservation pour cet évènement");
    }

    if (seats > event.maxSeatsPerBooking) {
      throw new Error(
        `Vous ne pouvez pas réserver plus de ${event.maxSeatsPerBooking} place(s)`
      );
    }

    if (typeof event.capacity === "number") {
      const bookedSeats = await this.eventBookingRepository.sumConfirmedSeats(
        eventId
      );
      if (bookedSeats + seats > event.capacity) {
        throw new Error("Il ne reste plus assez de places disponibles");
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
