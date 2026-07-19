import { DeleteMessageInput } from "@src/application/dtos/messages/deleteMessage.dto";
import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import { MessageId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

class DeleteMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(params: DeleteMessageInput): Promise<void> {
    const messageId = MessageId.from(params.messageId);
    const userId = UserId.from(params.userId);

    const existing = await this.messageRepository.findById(messageId);
    if (!existing || !existing.id) {
      throw new NotFoundError(
        ERROR_CODES.MESSAGE_NOT_FOUND,
        "Message not found"
      );
    }

    if (!existing.belongsTo(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.MESSAGE_FORBIDDEN,
        "You don't have permission to delete this message"
      );
    }

    await this.messageRepository.delete(existing.id);
  }
}

export default DeleteMessageUseCase;
