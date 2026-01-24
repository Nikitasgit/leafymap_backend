import { IMessageRepository } from "@/types/repositories/message.repository.types";

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
