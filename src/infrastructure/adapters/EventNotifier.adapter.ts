import CreateNotificationUseCase from "@src/application/usecases/notifications/CreateNotification.usecase";
import { IEventNotifier } from "@src/domain/interfaces/IEventNotifier";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";

class EventNotifierAdapter implements IEventNotifier {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase
  ) {}

  async notifyBookingCancelled(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.createNotificationUseCase.execute({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "event_booking_cancelled",
      referenceId: params.eventId,
      referenceType: "Event",
    });
  }
}

export default EventNotifierAdapter;
