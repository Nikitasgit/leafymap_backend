import { IEventNotifier } from "@src/domain/interfaces/IEventNotifier";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import NotificationService from "@/services/notificationService";

class LegacyEventNotifierAdapter implements IEventNotifier {
  constructor(private readonly notificationService: NotificationService) {}

  async notifyBookingCancelled(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.notificationService.createNotification({
      sender: params.senderId,
      receiver: params.receiverId,
      action: "event_booking_cancelled",
      reference: params.eventId,
      referenceType: "Event",
    });
  }
}

export default LegacyEventNotifierAdapter;
