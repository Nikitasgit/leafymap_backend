import { MessageListItem } from "@src/domain/interfaces/IMessageRepository";

export interface GetMessagesInput {
  conversationId: string;
  userId: string;
  senderId?: string;
  readByUserId?: string;
}

export interface GetMessagesResult {
  messages: MessageListItem[];
}
