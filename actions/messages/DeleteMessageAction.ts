import { IMessageRepository } from "../../repositories/messages/IMessageRepository";

export interface IDeleteMessageAction {
  execute(params: { messageId: string }): Promise<void>;
}

const DeleteMessageAction = (
  messageRepository: IMessageRepository
): IDeleteMessageAction => ({
  execute: async ({ messageId }) => {
    await messageRepository.deleteOne(messageId);
  },
});

export default DeleteMessageAction;
