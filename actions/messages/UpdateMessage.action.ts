import { IMessageRepository } from "@/types/repositories/message.repository.types";
import { UpdateMessageInput } from "../../validations/message.validations";

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
