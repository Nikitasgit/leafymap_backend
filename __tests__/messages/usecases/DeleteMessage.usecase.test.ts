import { Types } from "mongoose";
import DeleteMessageUseCase from "@src/application/usecases/messages/DeleteMessage.usecase";
import { Message } from "@src/domain/entities/Message.entity";
import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";
import { createMockMessageRepository } from "../../helpers/mockMessageRepository";

describe("DeleteMessageUseCase", () => {
  let messageRepository: jest.Mocked<IMessageRepository>;
  let useCase: DeleteMessageUseCase;

  beforeEach(() => {
    messageRepository = createMockMessageRepository();
    useCase = new DeleteMessageUseCase(messageRepository);
  });

  it("deletes when user owns the message", async () => {
    const userId = new Types.ObjectId().toString();
    const messageId = new Types.ObjectId().toString();
    messageRepository.findById.mockResolvedValue(
      Message.reconstitute({
        id: MessageId.from(messageId),
        conversationId: ConversationId.from(new Types.ObjectId().toString()),
        senderId: UserId.from(userId),
        content: "bye",
        readBy: [],
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await useCase.execute({ messageId, userId });
    expect(messageRepository.delete).toHaveBeenCalledWith(
      MessageId.from(messageId)
    );
  });

  it("forbids delete by non-owner", async () => {
    const messageId = new Types.ObjectId().toString();
    messageRepository.findById.mockResolvedValue(
      Message.reconstitute({
        id: MessageId.from(messageId),
        conversationId: ConversationId.from(new Types.ObjectId().toString()),
        senderId: UserId.from(new Types.ObjectId().toString()),
        content: "bye",
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
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.MESSAGE_FORBIDDEN,
    });
    expect(messageRepository.delete).not.toHaveBeenCalled();
  });
});
