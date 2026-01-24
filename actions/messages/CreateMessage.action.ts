import { IMessageRepository } from "@/types/repositories/message.repository.types";
import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { CreateMessageInput } from "../../validations/message.validations";
import { Types } from "mongoose";

export interface ICreateMessageAction {
  execute(params: {
    messageData: CreateMessageInput;
    senderId: string;
  }): Promise<{ _id: string }>;
}

class CreateMessageAction implements ICreateMessageAction {
  constructor(
    private messageRepository: IMessageRepository,
    private conversationRepository: IConversationRepository
  ) {}

  async execute({
    messageData,
    senderId,
  }: {
    messageData: CreateMessageInput;
    senderId: string;
  }): Promise<{ _id: string }> {
    const { recipientId, content } = messageData;

    const senderObjectId = new Types.ObjectId(senderId);
    const recipientObjectId = new Types.ObjectId(recipientId);

    let conversation = await this.conversationRepository.findOne({
      participants: {
        $all: [senderId, recipientId],
      },
    } as any);

    if (!conversation) {
      const conversationId = await this.conversationRepository.create({
        participants: [senderObjectId, recipientObjectId],
      });
      conversation = await this.conversationRepository.findById(
        conversationId.toString()
      );
    }

    if (!conversation) {
      throw new Error("Failed to create or find conversation");
    }

    const messageId = await this.messageRepository.create({
      conversation: conversation._id,
      sender: senderObjectId,
      content,
      isRead: false,
    });

    await this.conversationRepository.updateOne(conversation._id.toString(), {
      lastMessage: messageId,
    });

    return { _id: messageId.toString() };
  }
}

export default CreateMessageAction;
