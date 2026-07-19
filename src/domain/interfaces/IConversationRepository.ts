import { Conversation } from "@src/domain/entities/Conversation.entity";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface ConversationParticipantReadModel {
  _id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: {
    urls?: {
      thumbnail?: string;
      medium?: string;
      original?: string;
    };
  };
}

export interface ConversationLastMessageReadModel {
  content?: string;
  partnership?:
    | string
    | {
        type?: "place" | "event";
      };
  createdAt: Date | string;
}

export interface ConversationInboxItem {
  _id: string;
  participants: ConversationParticipantReadModel[];
  lastMessage?: ConversationLastMessageReadModel;
  unreadCount: number;
  updatedAt?: Date;
}

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
