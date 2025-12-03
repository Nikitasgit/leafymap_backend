import { IMessageRepository } from "../../repositories/messages/IMessageRepository";

export interface IUpdateMessageAction {
  execute(params: {
    messageId: string;
    messageData: { content: string };
  }): Promise<void>;
}

const UpdateMessageAction = (
  messageRepository: IMessageRepository
): IUpdateMessageAction => ({
  execute: async ({ messageId, messageData }) => {
    await messageRepository.updateOne(messageId, messageData);
  },
});

export default UpdateMessageAction;
