import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import NotificationService from "@/services/notificationService";

export interface UpdateEventBookingDTO {
  bookingId: string;
  requesterId: string;
  seats: number;
}

export interface IUpdateEventBookingAction {
  execute(params: UpdateEventBookingDTO): Promise<void>;
}

const getOwnerId = (owner: unknown): string | undefined => {
  if (!owner) return undefined;
  if (typeof owner === "object" && "_id" in (owner as any)) {
    return (owner as any)._id.toString();
  }
  return owner.toString();
};

class UpdateEventBookingAction implements IUpdateEventBookingAction {
  constructor(
    private eventBookingRepository: IEventBookingRepository,
    private eventRepository: IEventRepository,
    private notificationService: NotificationService
  ) {}

  async execute({
    bookingId,
    requesterId,
    seats,
  }: UpdateEventBookingDTO): Promise<void> {
    const booking = await this.eventBookingRepository.findById(bookingId, [
      "_id",
      "event",
      "user",
      "status",
    ]);

    if (!booking || booking.status !== "confirmed") {
      throw new Error("Réservation non trouvée");
    }

    const eventId = getOwnerId(booking.event) as string;
    const event = await this.eventRepository.findById(eventId, [
      "_id",
      "user",
      "capacity",
      "maxSeatsPerBooking",
      "lifecycleStatus",
    ]);

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.lifecycleStatus !== "upcoming") {
      throw new Error(
        "Cet évènement a déjà commencé ou est terminé, la réservation ne peut plus être modifiée"
      );
    }

    if (seats > event.maxSeatsPerBooking) {
      throw new Error(
        `Vous ne pouvez pas réserver plus de ${event.maxSeatsPerBooking} place(s)`
      );
    }

    if (typeof event.capacity === "number") {
      const bookedSeats = await this.eventBookingRepository.sumConfirmedSeats(
        eventId,
        bookingId
      );
      if (bookedSeats + seats > event.capacity) {
        throw new Error("Il ne reste plus assez de places disponibles");
      }
    }

    await this.eventBookingRepository.updateOne(bookingId, { seats });

    const bookingUserId = getOwnerId(booking.user) as string;
    const eventOwnerId = getOwnerId(event.user);
    const isOrganizerUpdating =
      eventOwnerId === requesterId && bookingUserId !== requesterId;

    if (isOrganizerUpdating) {
      await this.notificationService.createNotification({
        sender: requesterId,
        receiver: bookingUserId,
        action: "event_booking_cancelled",
        reference: eventId,
        referenceType: "Event",
      });
    }
  }
}

export default UpdateEventBookingAction;
