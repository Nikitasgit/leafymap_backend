import { IMessageRepository } from "@/types/repositories/message.repository.types";
import { Types } from "mongoose";

export interface IMarkMessagesAsReadAction {
  execute(params: {
    conversationId: string;
    userId: string;
  }): Promise<{ markedCount: number }>;
}

class MarkMessagesAsReadAction implements IMarkMessagesAsReadAction {
  constructor(private messageRepository: IMessageRepository) {}

  async execute({
    conversationId,
    userId,
  }: {
    conversationId: string;
    userId: string;
  }): Promise<{ markedCount: number }> {
    const userIdObjectId = new Types.ObjectId(userId);

    const unreadMessages = await this.messageRepository.findAll({
      filters: {
        conversation: conversationId,
        sender: { $ne: userIdObjectId },
        readBy: { $nin: [userIdObjectId] },
      },
      project: ["_id"],
    });

    const messageIds = unreadMessages.map((msg) => msg._id.toString());
    let markedCount = 0;

    for (const messageId of messageIds) {
      await this.messageRepository.markAsReadByUser(messageId, userId);
      markedCount++;
    }

    return { markedCount };
  }
}

export default MarkMessagesAsReadAction;
