import {
  IMessageRepository,
  MessageFilters,
} from "@/types/repositories/message.repository.types";
import { IMessage } from "@/types/models/message";
import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { IPartnershipPopulated } from "@/types/models/partnership";
import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { Types } from "mongoose";
import MessageService from "@/services/messageService";

export interface IGetMessagesAction {
  execute(params: {
    filters?: MessageFilters;
    conversationId?: string;
    userId?: string;
  }): Promise<{
    messages: IMessage[] | Partial<IMessage>[];
    participants?: any[];
  }>;
}

class GetMessagesAction implements IGetMessagesAction {
  private readonly project: (keyof IMessage | string)[] = [
    "_id",
    "conversation",
    "sender",
    "sender.username",
    "sender.image.urls",
    "content",
    "readBy",
    "partnership",
    "createdAt",
    "updatedAt",
  ];

  private messageService: MessageService;

  constructor(
    private messageRepository: IMessageRepository,
    private partnershipRepository: IPartnershipRepository,
    private conversationRepository: IConversationRepository
  ) {
    this.messageService = new MessageService();
  }

  async execute({
    filters,
    conversationId,
  }: {
    filters?: MessageFilters;
    conversationId?: string;
    userId?: string;
  }): Promise<{
    messages: IMessage[] | Partial<IMessage>[];
    participants?: any[];
  }> {
    if (!conversationId) {
      throw new Error("Conversation ID is required");
    }

    const messages = await this.messageRepository.findAll({
      filters,
      project: this.project,
      sort: { createdAt: 1 },
    });

    const messagesWithContent = await Promise.all(
      messages.map(async (message) => {
        if (!message.partnership) {
          return message;
        }
        const partnership = await this.partnershipRepository.findById(
          message.partnership.toString(),
          [
            "_id",
            "type",
            "place.location.label",
            "event.name",
            "initiator.username",
          ]
        );
        if (!partnership) {
          return message;
        }
        const populatedPartnership = partnership as IPartnershipPopulated;

        const placeLabel = populatedPartnership.place.location.label;
        const eventName = populatedPartnership.event?.name;
        const initiatorUsername = populatedPartnership.initiator.username;

        const content = this.messageService.sendPartnershipMessage({
          initiatorUsername,
          eventName,
          placeLabel,
          type: partnership.type,
        });

        return {
          ...message,
          content,
        };
      })
    );

    const conversation = await this.conversationRepository.findById(
      conversationId,
      [
        "participants",
        "participants._id",
        "participants.username",
        "participants.image.urls",
        "participants.place",
        "participants.place.placeCategory",
        "participants.place.placeCategory.name",
        "participants.place.location",
        "participants.place.location.label",
      ]
    );

    return {
      messages: messagesWithContent,
      participants: conversation?.participants || [],
    };
  }
}

export default GetMessagesAction;
