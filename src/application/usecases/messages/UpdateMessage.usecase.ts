import { UpdateMessageInput } from "@src/application/dtos/messages/updateMessage.dto";
import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import { MessageId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

class UpdateMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(params: UpdateMessageInput): Promise<void> {
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
        "You don't have permission to update this message"
      );
    }

    await this.messageRepository.update(existing.withContent(params.content));
  }
}

export default UpdateMessageUseCase;
