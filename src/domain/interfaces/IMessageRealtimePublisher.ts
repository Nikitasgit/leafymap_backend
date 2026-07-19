import { ConversationId } from "@src/domain/value-objects/ObjectId.vo";

export type NewMessageRealtimePayload = Record<string, unknown>;

export interface IMessageRealtimePublisher {
  publishNewMessage(
    conversationId: ConversationId,
    message: NewMessageRealtimePayload
  ): void;
}
