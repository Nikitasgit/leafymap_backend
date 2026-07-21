export interface CreateMessageInput {
  senderId: string;
  recipientId: string;
  content: string;
}

export interface CreateMessageResult {
  id: string;
  conversationId: string;
}
