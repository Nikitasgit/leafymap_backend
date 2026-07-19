import { Types } from "mongoose";
import MarkMessagesAsReadUseCase from "@src/application/usecases/messages/MarkMessagesAsRead.usecase";
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

describe("MarkMessagesAsReadUseCase", () => {
  let messageRepository: jest.Mocked<IMessageRepository>;
  let conversationRepository: jest.Mocked<IConversationRepository>;
  let useCase: MarkMessagesAsReadUseCase;

  beforeEach(() => {
    messageRepository = createMockMessageRepository();
    conversationRepository = createMockConversationRepository();
    useCase = new MarkMessagesAsReadUseCase(
      messageRepository,
      conversationRepository
    );
  });

  it("marks unread messages for a participant", async () => {
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
    messageRepository.markConversationAsRead.mockResolvedValue(3);

    await expect(
      useCase.execute({ conversationId, userId })
    ).resolves.toEqual({ markedCount: 3 });
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
    expect(messageRepository.markConversationAsRead).not.toHaveBeenCalled();
  });
});
