import { ConversationInboxItemReadModel } from "@src/domain/read-models/conversation.read-models";

export interface GetConversationsInput {
  userId: string;
}

export type GetConversationsResult = ConversationInboxItemReadModel[];
