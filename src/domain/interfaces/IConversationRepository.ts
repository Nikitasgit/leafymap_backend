import { Conversation } from "@src/domain/entities/Conversation.entity";
import { ConversationInboxItem } from "@src/domain/read-models/conversation.read-models";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface IConversationRepository {
  save(conversation: Conversation): Promise<ConversationId>;
  findById(id: ConversationId): Promise<Conversation | null>;
  findBetweenUsers(
    userId: UserId,
    otherUserId: UserId
  ): Promise<Conversation | null>;
  findIdsForUser(userId: UserId): Promise<ConversationId[]>;
  findInboxForUser(userId: UserId): Promise<ConversationInboxItem[]>;
  updateLastMessage(
    conversationId: ConversationId,
    messageId: MessageId
  ): Promise<void>;
}
