import { IMessageRepository } from "../../repositories/messages/IMessageRepository";
import { UpdateMessageInput } from "../../validations/messageValidations";

export interface IUpdateMessageAction {
  execute(params: {
    messageId: string;
    messageData: UpdateMessageInput;
  }): Promise<void>;
}

class UpdateMessageAction implements IUpdateMessageAction {
  constructor(private messageRepository: IMessageRepository) {}

  async execute({
    messageId,
    messageData,
  }: {
    messageId: string;
    messageData: UpdateMessageInput;
  }): Promise<void> {
    await this.messageRepository.updateOne(messageId, messageData);
  }
}

export default UpdateMessageAction;
