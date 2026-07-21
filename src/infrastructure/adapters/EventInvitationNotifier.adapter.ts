import { IEventInvitationNotifier } from "@src/domain/interfaces/IEventInvitationNotifier";
import { INotificationCreator } from "@src/domain/interfaces/INotificationCreator";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";

class EventInvitationNotifierAdapter implements IEventInvitationNotifier {
  constructor(private readonly notificationCreator: INotificationCreator) {}

  async notifyInvitation(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.notificationCreator.create({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "event_invitation",
      referenceId: params.eventId,
      referenceType: "Event",
    });
  }

  async notifyAccepted(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.notificationCreator.create({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "event_accepted",
      referenceId: params.eventId,
      referenceType: "Event",
    });
  }

  async notifyRefused(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.notificationCreator.create({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "event_refused",
      referenceId: params.eventId,
      referenceType: "Event",
    });
  }
}

export default EventInvitationNotifierAdapter;
