import {
  MarkMessagesAsReadInput,
  MarkMessagesAsReadResult,
} from "@src/application/dtos/messages/markMessagesAsRead.dto";
import { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";
import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import {
  ConversationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

class MarkMessagesAsReadUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(
    params: MarkMessagesAsReadInput
  ): Promise<MarkMessagesAsReadResult> {
    const conversationId = ConversationId.from(params.conversationId);
    const userId = UserId.from(params.userId);

    const conversation =
      await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError(
        ERROR_CODES.CONVERSATION_NOT_FOUND,
        "Conversation not found"
      );
    }

    if (!conversation.isParticipant(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.CONVERSATION_FORBIDDEN,
        "You are not allowed to mark messages in this conversation"
      );
    }

    const markedCount = await this.messageRepository.markConversationAsRead(
      conversationId,
      userId
    );

    return { markedCount };
  }
}

export default MarkMessagesAsReadUseCase;
