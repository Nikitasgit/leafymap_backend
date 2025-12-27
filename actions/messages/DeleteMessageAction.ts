import { IMessageRepository } from "../../repositories/messages/IMessageRepository";

export interface IDeleteMessageAction {
  execute(params: { messageId: string }): Promise<void>;
}

class DeleteMessageAction implements IDeleteMessageAction {
  constructor(private messageRepository: IMessageRepository) {}

  async execute({ messageId }: { messageId: string }): Promise<void> {
    await this.messageRepository.deleteOne(messageId);
  }
}

export default DeleteMessageAction;
