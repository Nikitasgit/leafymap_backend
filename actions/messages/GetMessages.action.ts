import {
  IMessageRepository,
  MessageFilters,
} from "@/types/repositories/message.repository.types";
import { IMessage } from "@/types/models/message";
import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { IPartnershipPopulated } from "@/types/models/partnership";
import MessageService from "@/services/messageService";

export interface IGetMessagesAction {
  execute(params: {
    filters?: MessageFilters;
  }): Promise<IMessage[] | Partial<IMessage>[]>;
}

class GetMessagesAction implements IGetMessagesAction {
  private readonly project: (keyof IMessage | string)[] = [
    "_id",
    "conversation",
    "sender",
    "sender.username",
    "sender.image.urls",
    "content",
    "isRead",
    "partnership",
    "createdAt",
    "updatedAt",
  ];

  private messageService: MessageService;

  constructor(
    private messageRepository: IMessageRepository,
    private partnershipRepository: IPartnershipRepository
  ) {
    this.messageService = new MessageService();
  }

  async execute({
    filters,
  }: {
    filters?: MessageFilters;
  }): Promise<IMessage[] | Partial<IMessage>[]> {
    const messages = await this.messageRepository.findAll({
      filters,
      project: this.project,
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

    return messagesWithContent;
  }
}

export default GetMessagesAction;
