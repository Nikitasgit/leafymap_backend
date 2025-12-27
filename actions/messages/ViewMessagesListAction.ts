import {
  IMessageRepository,
  MessageFilters,
} from "../../repositories/messages/IMessageRepository";
import { IMessage } from "../../types/models/message";

export interface IViewMessagesListAction {
  execute(params: {
    filters?: MessageFilters;
  }): Promise<IMessage[] | Partial<IMessage>[]>;
}

class ViewMessagesListAction implements IViewMessagesListAction {
  private readonly project: (keyof IMessage | string)[] = [
    "_id",
    "senderId.username",
    "senderId.creatorName",
    "senderId.image.urls",
    "recipientId.username",
    "recipientId.creatorName",
    "recipientId.image.urls",
    "content",
    "isRead",
    "createdAt",
    "updatedAt",
  ];

  constructor(private messageRepository: IMessageRepository) {}

  async execute({
    filters,
  }: {
    filters?: MessageFilters;
  }): Promise<IMessage[] | Partial<IMessage>[]> {
    const messages = await this.messageRepository.findAll({
      filters,
      project: this.project,
    });
    return messages;
  }
}

export default ViewMessagesListAction;
