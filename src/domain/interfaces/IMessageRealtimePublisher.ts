import { ConversationId } from "@src/domain/value-objects/ObjectId.vo";
import type { MessageListItemReadModel } from "@src/domain/read-models/message.read-models";

export type NewMessageRealtimePayload = MessageListItemReadModel;

export interface IMessageRealtimePublisher {
  publishNewMessage(
    conversationId: ConversationId,
    message: NewMessageRealtimePayload
  ): void;
}
