import CreateNotificationUseCase from "@src/application/usecases/notifications/CreateNotification.usecase";
import { IEventInvitationNotifier } from "@src/domain/interfaces/IEventInvitationNotifier";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";

class EventInvitationNotifierAdapter implements IEventInvitationNotifier {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase
  ) {}

  async notifyInvitation(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void> {
    await this.createNotificationUseCase.execute({
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
    await this.createNotificationUseCase.execute({
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
    await this.createNotificationUseCase.execute({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "event_refused",
      referenceId: params.eventId,
      referenceType: "Event",
    });
  }
}

export default EventInvitationNotifierAdapter;
