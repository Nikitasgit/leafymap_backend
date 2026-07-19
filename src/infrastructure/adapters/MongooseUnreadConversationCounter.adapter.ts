import { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";
import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import { IUnreadConversationCounter } from "@src/domain/interfaces/IUnreadConversationCounter";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

class MongooseUnreadConversationCounter
  implements IUnreadConversationCounter
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  async countForUser(userId: UserId): Promise<number> {
    const conversationIds =
      await this.conversationRepository.findIdsForUser(userId);

    let count = 0;
    for (const conversationId of conversationIds) {
      const hasUnread = await this.messageRepository.hasUnreadInConversation(
        conversationId,
        userId
      );
      if (hasUnread) {
        count++;
      }
    }
    return count;
  }
}

export default MongooseUnreadConversationCounter;
