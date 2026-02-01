import {
  IMessageRepository,
  MessageFilters,
} from "@/types/repositories/message.repository.types";
import { IMessage } from "@/types/models/message";

export interface IGetMessagesAction {
  execute(params: {
    filters?: MessageFilters;
    conversationId?: string;
  }): Promise<{
    messages: IMessage[] | Partial<IMessage>[];
  }>;
}

class GetMessagesAction implements IGetMessagesAction {
  private readonly project: (keyof IMessage | string)[] = [
    "_id",
    "conversation",
    "sender",
    "sender.username",
    "sender.firstname",
    "sender.lastname",
    "sender.email",
    "sender.image.urls",
    "content",
    "readBy",
    "partnership.type",
    "partnership.event.name",
    "partnership.event.description",
    "partnership.event.lifecycleStatus",
    "partnership.event.image.urls",
    "partnership.event.dateRange",
    "partnership.place.location",
    "partnership.place.placeCategory.name",
    "partnership.place.followers",
    "createdAt",
    "updatedAt",
  ];

  constructor(private messageRepository: IMessageRepository) {}

  async execute({
    filters,
    conversationId,
  }: {
    filters?: MessageFilters;
    conversationId?: string;
  }): Promise<{
    messages: IMessage[] | Partial<IMessage>[];
  }> {
    if (!conversationId) {
      throw new Error("Conversation ID is required");
    }

    const messages = await this.messageRepository.findAll({
      filters,
      project: this.project,
      sort: { createdAt: 1 },
    });

    return { messages };
  }
}

export default GetMessagesAction;
