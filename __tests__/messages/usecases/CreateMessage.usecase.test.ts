import { Types } from "mongoose";
import CreateMessageUseCase from "@src/application/usecases/messages/CreateMessage.usecase";
import { Conversation } from "@src/domain/entities/Conversation.entity";
import { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";
import { IMessageRealtimePublisher } from "@src/domain/interfaces/IMessageRealtimePublisher";
import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { createMockConversationRepository } from "../../helpers/mockConversationRepository";
import { createMockMessageRepository } from "../../helpers/mockMessageRepository";

describe("CreateMessageUseCase", () => {
  let messageRepository: jest.Mocked<IMessageRepository>;
  let conversationRepository: jest.Mocked<IConversationRepository>;
  let realtimePublisher: jest.Mocked<IMessageRealtimePublisher>;
  let useCase: CreateMessageUseCase;

  beforeEach(() => {
    messageRepository = createMockMessageRepository();
    conversationRepository = createMockConversationRepository();
    realtimePublisher = { publishNewMessage: jest.fn() };
    useCase = new CreateMessageUseCase(
      messageRepository,
      conversationRepository,
      realtimePublisher
    );
  });

  it("reuses an existing conversation and publishes realtime", async () => {
    const senderId = new Types.ObjectId().toString();
    const recipientId = new Types.ObjectId().toString();
    const conversationId = ConversationId.from(new Types.ObjectId().toString());
    const messageId = MessageId.from(new Types.ObjectId().toString());

    conversationRepository.findBetweenUsers.mockResolvedValue(
      Conversation.reconstitute({
        id: conversationId,
        participantIds: [UserId.from(senderId), UserId.from(recipientId)],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    messageRepository.save.mockResolvedValue(messageId);
    messageRepository.findPopulatedById.mockResolvedValue({
      id: messageId,
      conversation: conversationId,
      content: "hello",
      readBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        senderId,
        recipientId,
        content: "hello",
      })
    ).resolves.toEqual({
      id: messageId,
      conversationId,
    });

    expect(conversationRepository.save).not.toHaveBeenCalled();
    expect(conversationRepository.updateLastMessage).toHaveBeenCalledWith(
      conversationId,
      messageId
    );
    expect(realtimePublisher.publishNewMessage).toHaveBeenCalled();
  });

  it("creates a conversation when none exists", async () => {
    const senderId = new Types.ObjectId().toString();
    const recipientId = new Types.ObjectId().toString();
    const conversationId = ConversationId.from(new Types.ObjectId().toString());
    const messageId = MessageId.from(new Types.ObjectId().toString());

    conversationRepository.findBetweenUsers.mockResolvedValue(null);
    conversationRepository.save.mockResolvedValue(conversationId);
    conversationRepository.findById.mockResolvedValue(
      Conversation.reconstitute({
        id: conversationId,
        participantIds: [UserId.from(senderId), UserId.from(recipientId)],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    messageRepository.save.mockResolvedValue(messageId);
    messageRepository.findPopulatedById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        senderId,
        recipientId,
        content: "first",
      })
    ).resolves.toEqual({
      id: messageId,
      conversationId,
    });

    expect(conversationRepository.save).toHaveBeenCalled();
    expect(realtimePublisher.publishNewMessage).not.toHaveBeenCalled();
  });
});
