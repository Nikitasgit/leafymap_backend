import { IMessageRepository } from "../../repositories/messages/IMessageRepository";
import { CreateMessageInput } from "../../validations/messageValidations";
import { Types } from "mongoose";

export interface ICreateMessageAction {
  execute(params: {
    messageData: CreateMessageInput;
    senderId: string;
  }): Promise<{ _id: string }>;
}

class CreateMessageAction implements ICreateMessageAction {
  constructor(private messageRepository: IMessageRepository) {}

  async execute({
    messageData,
    senderId,
  }: {
    messageData: CreateMessageInput;
    senderId: string;
  }): Promise<{ _id: string }> {
    const { recipientId, content } = messageData;

    const messageId = await this.messageRepository.create({
      senderId: new Types.ObjectId(senderId),
      recipientId: new Types.ObjectId(recipientId),
      content,
      isRead: false,
    });

    return { _id: messageId.toString() };
  }
}

export default CreateMessageAction;
