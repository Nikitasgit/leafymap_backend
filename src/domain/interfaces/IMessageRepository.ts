import { Message } from "@src/domain/entities/Message.entity";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface MessageSenderReadModel {
  _id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: {
    urls?: {
      original?: string;
      thumbnail?: string;
      medium?: string;
    };
  };
}

export interface MessageListItem {
  _id: string;
  conversation: string;
  sender?: MessageSenderReadModel | string;
  content?: string;
  readBy: string[];
  partnership?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface FindMessagesByConversationParams {
  conversationId: ConversationId;
  senderId?: UserId;
  readByUserId?: UserId;
}

export interface IMessageRepository {
  save(message: Message): Promise<MessageId>;
  findById(id: MessageId): Promise<Message | null>;
  findPopulatedById(id: MessageId): Promise<MessageListItem | null>;
  findByConversation(
    params: FindMessagesByConversationParams
  ): Promise<MessageListItem[]>;
  update(message: Message): Promise<void>;
  delete(id: MessageId): Promise<void>;
  markConversationAsRead(
    conversationId: ConversationId,
    userId: UserId
  ): Promise<number>;
  hasUnreadInConversation(
    conversationId: ConversationId,
    userId: UserId
  ): Promise<boolean>;
}
