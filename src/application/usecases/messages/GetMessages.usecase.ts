import {
  GetMessagesInput,
  GetMessagesResult,
} from "@src/application/dtos/messages/getMessages.dto";
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

class GetMessagesUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(params: GetMessagesInput): Promise<GetMessagesResult> {
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
        "You are not allowed to view this conversation"
      );
    }

    const messages = await this.messageRepository.findByConversation({
      conversationId,
      senderId: params.senderId
        ? UserId.from(params.senderId)
        : undefined,
      readByUserId: params.readByUserId
        ? UserId.from(params.readByUserId)
        : undefined,
    });

    return { messages };
  }
}

export default GetMessagesUseCase;
