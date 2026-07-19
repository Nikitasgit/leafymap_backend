import { Types } from "mongoose";
import UpdateMessageUseCase from "@src/application/usecases/messages/UpdateMessage.usecase";
import { Message } from "@src/domain/entities/Message.entity";
import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";
import { createMockMessageRepository } from "../../helpers/mockMessageRepository";

describe("UpdateMessageUseCase", () => {
  let messageRepository: jest.Mocked<IMessageRepository>;
  let useCase: UpdateMessageUseCase;

  beforeEach(() => {
    messageRepository = createMockMessageRepository();
    useCase = new UpdateMessageUseCase(messageRepository);
  });

  it("updates content when user owns the message", async () => {
    const userId = new Types.ObjectId().toString();
    const messageId = new Types.ObjectId().toString();
    messageRepository.findById.mockResolvedValue(
      Message.reconstitute({
        id: MessageId.from(messageId),
        conversationId: ConversationId.from(new Types.ObjectId().toString()),
        senderId: UserId.from(userId),
        content: "old",
        readBy: [],
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await useCase.execute({
      messageId,
      userId,
      content: "new",
    });

    expect(messageRepository.update).toHaveBeenCalled();
  });

  it("forbids update by non-owner", async () => {
    const messageId = new Types.ObjectId().toString();
    messageRepository.findById.mockResolvedValue(
      Message.reconstitute({
        id: MessageId.from(messageId),
        conversationId: ConversationId.from(new Types.ObjectId().toString()),
        senderId: UserId.from(new Types.ObjectId().toString()),
        content: "old",
        readBy: [],
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await expect(
      useCase.execute({
        messageId,
        userId: new Types.ObjectId().toString(),
        content: "new",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.MESSAGE_FORBIDDEN,
    });
    expect(messageRepository.update).not.toHaveBeenCalled();
  });
});
