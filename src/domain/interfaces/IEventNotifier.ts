import {
  EventId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface IEventNotifier {
  notifyBookingCancelled(params: {
    senderId: UserId;
    receiverId: UserId;
    eventId: EventId;
  }): Promise<void>;
}
