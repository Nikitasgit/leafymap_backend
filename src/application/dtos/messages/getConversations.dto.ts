import { ConversationInboxItem } from "@src/domain/interfaces/IConversationRepository";

export interface GetConversationsInput {
  userId: string;
}

export type GetConversationsResult = ConversationInboxItem[];
