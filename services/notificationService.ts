import { Types } from "mongoose";
import Conversation from "@/models/Conversation";
import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { IMessageRepository } from "@/types/repositories/message.repository.types";

class NotificationService {
  constructor(
    private conversationRepository: IConversationRepository,
    private messageRepository: IMessageRepository,
  ) {}
  
  async countUserUnreadConversations(userId: string): Promise<number> {
    let count = 0;
    const userIdObjectId = new Types.ObjectId(userId);
    
    const conversations = await this.conversationRepository.findAll({
      filters: {
        participants: userId,
      },
      project: ["_id"],
    });
    
    for (const conversation of conversations) {
      const unreadMessage = await this.messageRepository.findOne({
        conversation: conversation._id.toString(),
        readBy: { $nin: [userIdObjectId] },
        sender: { $ne: userIdObjectId },
      });
      
      if (unreadMessage) {
        count++;
      }
    }
    return count;
  }

}

export default NotificationService;
