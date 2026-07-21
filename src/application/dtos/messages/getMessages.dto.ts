import { MessageListItemReadModel } from "@src/domain/read-models/message.read-models";

export interface GetMessagesInput {
  conversationId: string;
  userId: string;
  senderId?: string;
  readByUserId?: string;
}

export interface GetMessagesResult {
  messages: MessageListItemReadModel[];
}
