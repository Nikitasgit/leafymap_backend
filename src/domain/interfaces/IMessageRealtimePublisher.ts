import { ConversationId } from "@src/domain/value-objects/ObjectId.vo";
import type { MessageListItem } from "@src/domain/read-models/message.read-models";

export type NewMessageRealtimePayload = MessageListItem;

export interface IMessageRealtimePublisher {
  publishNewMessage(
    conversationId: ConversationId,
    message: NewMessageRealtimePayload
  ): void;
}
