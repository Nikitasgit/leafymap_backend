export interface GetConversationWithUserInput {
  userId: string;
  otherUserId: string;
}

export interface GetConversationWithUserResult {
  conversationId: string | null;
}
