import {
  CreateMessageInput,
  CreateMessageResult,
} from "@src/application/dtos/messages/createMessage.dto";
import { Conversation } from "@src/domain/entities/Conversation.entity";
import { Message } from "@src/domain/entities/Message.entity";
import { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";
import { IMessageRealtimePublisher } from "@src/domain/interfaces/IMessageRealtimePublisher";
import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import {
  ConversationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

class CreateMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly realtimePublisher: IMessageRealtimePublisher
  ) {}

  async execute(params: CreateMessageInput): Promise<CreateMessageResult> {
    const senderId = UserId.from(params.senderId);
    const recipientId = UserId.from(params.recipientId);

    let conversation = await this.conversationRepository.findBetweenUsers(
      senderId,
      recipientId
    );

    if (!conversation) {
      const created = Conversation.create({
        participantIds: [senderId, recipientId],
      });
      const conversationId = await this.conversationRepository.save(created);
      conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation || !conversation.id) {
        throw new NotFoundError(
          ERROR_CODES.CONVERSATION_NOT_FOUND,
          "Failed to create or find conversation"
        );
      }
    }

    const conversationId = conversation.id as ConversationId;
    const message = Message.create({
      conversationId,
      senderId,
      content: params.content,
    });
    const messageId = await this.messageRepository.save(message);
    await this.conversationRepository.updateLastMessage(
      conversationId,
      messageId
    );

    const populated = await this.messageRepository.findPopulatedById(messageId);
    if (populated) {
      this.realtimePublisher.publishNewMessage(
        conversationId,
        populated
      );
    }

    return {
      id: messageId,
      conversationId,
    };
  }
}

export default CreateMessageUseCase;
