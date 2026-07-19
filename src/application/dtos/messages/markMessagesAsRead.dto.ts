export interface MarkMessagesAsReadInput {
  conversationId: string;
  userId: string;
}

export interface MarkMessagesAsReadResult {
  markedCount: number;
}
