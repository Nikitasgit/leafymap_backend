import { Types } from "mongoose";
import GetMessagesUseCase from "@src/application/usecases/messages/GetMessages.usecase";
import { Conversation } from "@src/domain/entities/Conversation.entity";
import { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";
import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import {
  ConversationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";
import { createMockConversationRepository } from "../../helpers/mockConversationRepository";
import { createMockMessageRepository } from "../../helpers/mockMessageRepository";

describe("GetMessagesUseCase", () => {
  let messageRepository: jest.Mocked<IMessageRepository>;
  let conversationRepository: jest.Mocked<IConversationRepository>;
  let useCase: GetMessagesUseCase;

  beforeEach(() => {
    messageRepository = createMockMessageRepository();
    conversationRepository = createMockConversationRepository();
    useCase = new GetMessagesUseCase(
      messageRepository,
      conversationRepository
    );
  });

  it("returns messages for a participant", async () => {
    const userId = new Types.ObjectId().toString();
    const conversationId = new Types.ObjectId().toString();
    conversationRepository.findById.mockResolvedValue(
      Conversation.reconstitute({
        id: ConversationId.from(conversationId),
        participantIds: [
          UserId.from(userId),
          UserId.from(new Types.ObjectId().toString()),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    messageRepository.findByConversation.mockResolvedValue([]);

    await expect(
      useCase.execute({ conversationId, userId })
    ).resolves.toEqual({ messages: [] });
  });

  it("forbids non-participants", async () => {
    const conversationId = new Types.ObjectId().toString();
    conversationRepository.findById.mockResolvedValue(
      Conversation.reconstitute({
        id: ConversationId.from(conversationId),
        participantIds: [
          UserId.from(new Types.ObjectId().toString()),
          UserId.from(new Types.ObjectId().toString()),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await expect(
      useCase.execute({
        conversationId,
        userId: new Types.ObjectId().toString(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.CONVERSATION_FORBIDDEN,
    });
    expect(messageRepository.findByConversation).not.toHaveBeenCalled();
  });

  it("throws when conversation is missing", async () => {
    conversationRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        conversationId: new Types.ObjectId().toString(),
        userId: new Types.ObjectId().toString(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.CONVERSATION_NOT_FOUND,
    });
  });
});
