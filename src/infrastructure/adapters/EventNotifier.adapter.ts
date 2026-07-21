import { IEventNotifier } from "@src/domain/interfaces/IEventNotifier";
import { INotificationCreator } from "@src/domain/interfaces/INotificationCreator";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";

class EventNotifierAdapter implements IEventNotifier {
  constructor(private readonly notificationCreator: INotificationCreator) {}

  async notifyBookingCancelled(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.notificationCreator.create({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "event_booking_cancelled",
      referenceId: params.eventId,
      referenceType: "Event",
    });
  }
}

export default EventNotifierAdapter;
