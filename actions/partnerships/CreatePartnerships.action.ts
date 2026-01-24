import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { IPartnership } from "@/types/models/partnership";
import { PartnershipDTO } from "@/types/api/partnership.dto";
import { IMessageRepository } from "@/types/repositories/message.repository.types";
import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { Types } from "mongoose";
import logger from "@/utils/logger";

export interface CreatePartnershipsDTO {
  partnerships: PartnershipDTO[];
}

export interface ICreatePartnershipsAction {
  execute(params: {
    partnerships: PartnershipDTO[];
    placeId: string;
    eventId?: string;
    initiatorId: string;
  }): Promise<IPartnership[]>;
}

class CreatePartnershipsAction implements ICreatePartnershipsAction {
  constructor(
    private partnershipRepository: IPartnershipRepository,
    private messageRepository: IMessageRepository,
    private conversationRepository: IConversationRepository
  ) {}

  async execute({
    partnerships,
    placeId,
    eventId,
    initiatorId,
  }: {
    partnerships: PartnershipDTO[];
    placeId: string;
    eventId?: string;
    initiatorId: string;
  }): Promise<IPartnership[]> {
    const createPromises = partnerships.map(
      async (partnership: PartnershipDTO) => {
        const existingPartnership = await this.partnershipRepository.findOne({
          place: new Types.ObjectId(placeId),
          event: eventId ? new Types.ObjectId(eventId) : undefined,
          collaborator: new Types.ObjectId(partnership.collaborator._id!),
        } as Partial<IPartnership>);

        if (existingPartnership) {
          return existingPartnership;
        }

        const partnershipId = await this.partnershipRepository.create({
          place: new Types.ObjectId(placeId),
          event: eventId ? new Types.ObjectId(eventId) : undefined,
          initiator: new Types.ObjectId(initiatorId),
          collaborator: new Types.ObjectId(partnership.collaborator._id!),
          type: eventId ? "event" : "place",
          status: "pending",
          deleted: false,
        } as Partial<IPartnership>);

        const newPartnership = await this.partnershipRepository.findById(
          partnershipId.toString()
        );

        if (!newPartnership) {
          throw new Error("Failed to create partnership");
        }

        // Créer un message automatique pour notifier le collaborateur
        try {
          const initiatorObjectId = new Types.ObjectId(initiatorId);
          const collaboratorObjectId = new Types.ObjectId(
            partnership.collaborator._id!
          );
          let conversation = await this.conversationRepository.findOne({
            participants: {
              $all: [initiatorId, partnership.collaborator._id!],
            },
          } as any);

          if (!conversation) {
            const conversationId = await this.conversationRepository.create({
              participants: [initiatorObjectId, collaboratorObjectId],
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
            sender: initiatorObjectId,
            isRead: false,
            partnership: newPartnership._id,
          });
          await this.conversationRepository.updateOne(
            conversation._id.toString(),
            {
              lastMessage: messageId,
            }
          );
        } catch (error) {
          logger.error(
            "Erreur lors de la création du message de partnership:",
            error
          );
        }

        return newPartnership;
      }
    );

    const createdPartnerships = await Promise.all(createPromises);
    return createdPartnerships;
  }
}

export default CreatePartnershipsAction;
