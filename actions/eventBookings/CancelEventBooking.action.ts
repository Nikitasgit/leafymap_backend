import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import NotificationService from "@/services/notificationService";
import { ERROR_CODES, ForbiddenError, NotFoundError } from "@/utils/errors";

export interface CancelEventBookingDTO {
  bookingId: string;
  requesterId: string;
}

export interface ICancelEventBookingAction {
  execute(params: CancelEventBookingDTO): Promise<void>;
}

const getOwnerId = (owner: unknown): string | undefined => {
  if (!owner) return undefined;
  if (typeof owner === "object" && "_id" in (owner as any)) {
    return (owner as any)._id.toString();
  }
  return owner.toString();
};

class CancelEventBookingAction implements ICancelEventBookingAction {
  constructor(
    private eventBookingRepository: IEventBookingRepository,
    private eventRepository: IEventRepository,
    private notificationService: NotificationService
  ) {}

  async execute({ bookingId, requesterId }: CancelEventBookingDTO): Promise<void> {
    const booking = await this.eventBookingRepository.findById(bookingId, [
      "_id",
      "event",
      "user",
      "status",
    ]);

    if (!booking) {
      throw new NotFoundError(
        ERROR_CODES.EVENT_BOOKING_NOT_FOUND,
        "Réservation non trouvée"
      );
    }

    if (booking.status === "cancelled") {
      return;
    }

    const eventId = getOwnerId(booking.event) as string;
    const event = await this.eventRepository.findById(eventId, [
      "_id",
      "user",
      "lifecycleStatus",
    ]);

    if (event && event.lifecycleStatus !== "upcoming") {
      throw new ForbiddenError(
        ERROR_CODES.EVENT_BOOKING_CANCEL_CLOSED,
        "Cet évènement a déjà commencé ou est terminé, la réservation ne peut plus être annulée"
      );
    }

    await this.eventBookingRepository.updateOne(bookingId, {
      status: "cancelled",
      cancelledAt: new Date(),
    });

    const bookingUserId = getOwnerId(booking.user) as string;

    if (bookingUserId === requesterId) {
      return;
    }

    const eventOwnerId = event ? getOwnerId(event.user) : undefined;

    if (eventOwnerId === requesterId) {
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

export default CancelEventBookingAction;
