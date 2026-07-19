export interface CreateMessageInput {
  senderId: string;
  recipientId: string;
  content: string;
}

export interface CreateMessageResult {
  _id: string;
  conversationId: string;
}
