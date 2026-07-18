import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IEventInvitationNotifier {
  notifyInvitation(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void>;

  notifyAccepted(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void>;

  notifyRefused(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void>;
}
