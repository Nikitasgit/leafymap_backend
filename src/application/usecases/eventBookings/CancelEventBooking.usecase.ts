import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IEventNotifier } from "@src/domain/interfaces/IEventNotifier";
import {
  EventBookingId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

export interface ICancelEventBookingUseCase {
  execute(params: {
    bookingId: string;
    requesterId: string;
  }): Promise<void>;
}

class CancelEventBookingUseCase implements ICancelEventBookingUseCase {
  constructor(
    private readonly eventBookingRepository: IEventBookingRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventNotifier: IEventNotifier
  ) {}

  async execute(params: {
    bookingId: string;
    requesterId: string;
  }): Promise<void> {
    const bookingId = EventBookingId.from(params.bookingId);
    const requesterId = UserId.from(params.requesterId);

    const booking = await this.eventBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError(
        ERROR_CODES.EVENT_BOOKING_NOT_FOUND,
        "Réservation non trouvée"
      );
    }

    if (booking.status === "cancelled") {
      return;
    }

    const event = await this.eventRepository.findById(booking.eventId);
    const isBookingOwner = booking.belongsTo(requesterId);
    const isEventOwner = event ? event.belongsTo(requesterId) : false;

    if (!isBookingOwner && !isEventOwner) {
      throw new ForbiddenError(
        ERROR_CODES.FORBIDDEN,
        "You don't have permission to cancel this booking"
      );
    }

    if (event && event.lifecycleStatus !== "upcoming") {
      throw new ForbiddenError(
        ERROR_CODES.EVENT_BOOKING_CANCEL_CLOSED,
        "Cet évènement a déjà commencé ou est terminé, la réservation ne peut plus être annulée"
      );
    }

    const cancelled = booking.cancel();
    await this.eventBookingRepository.update(cancelled);

    if (isBookingOwner) {
      return;
    }

    if (isEventOwner) {
      await this.eventNotifier.notifyBookingCancelled({
        senderId: requesterId,
        receiverId: booking.userId,
        eventId: booking.eventId,
      });
    }
  }
}

export default CancelEventBookingUseCase;
