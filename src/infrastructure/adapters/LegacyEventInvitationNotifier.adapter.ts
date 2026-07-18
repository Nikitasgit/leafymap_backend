import { IEventInvitationNotifier } from "@src/domain/interfaces/IEventInvitationNotifier";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import NotificationService from "@/services/notificationService";

class LegacyEventInvitationNotifierAdapter
  implements IEventInvitationNotifier
{
  constructor(private readonly notificationService: NotificationService) {}

  async notifyInvitation(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.notificationService.createNotification({
      sender: params.senderId,
      receiver: params.receiverId,
      action: "event_invitation",
      reference: params.eventId,
      referenceType: "Event",
    });
  }

  async notifyAccepted(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.notificationService.createNotification({
      sender: params.senderId,
      receiver: params.receiverId,
      action: "event_accepted",
      reference: params.eventId,
      referenceType: "Event",
    });
  }

  async notifyRefused(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.notificationService.createNotification({
      sender: params.senderId,
      receiver: params.receiverId,
      action: "event_refused",
      reference: params.eventId,
      referenceType: "Event",
    });
  }
}

export default LegacyEventInvitationNotifierAdapter;
