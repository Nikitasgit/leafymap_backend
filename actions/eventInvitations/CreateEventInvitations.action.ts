import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { IEventInvitation } from "@/types/models/eventInvitation";
import { EventInvitationDTO } from "@/types/api/eventInvitation.dto";
import { Types } from "mongoose";

export interface CreateEventInvitationsDTO {
  eventInvitations: EventInvitationDTO[];
}

export interface ICreateEventInvitationsAction {
  execute(params: {
    eventInvitations: EventInvitationDTO[];
    eventId: string;
    initiatorId: string;
  }): Promise<void>;
}

class CreateEventInvitationsAction implements ICreateEventInvitationsAction {
  constructor(private eventInvitationRepository: IEventInvitationRepository) {}

  async execute({
    eventInvitations,
    eventId,
    initiatorId,
  }: {
    eventInvitations: EventInvitationDTO[];
    eventId: string;
    initiatorId: string;
  }): Promise<void> {
    const createPromises = eventInvitations.map(
      async (eventInvitation: EventInvitationDTO) => {
        const existingInvitation = await this.eventInvitationRepository.findOne(
          {
            event: new Types.ObjectId(eventId),
            collaborator: new Types.ObjectId(eventInvitation.collaborator._id!),
          } as Partial<IEventInvitation>
        );

        if (existingInvitation) {
          return;
        }

        await this.eventInvitationRepository.create({
          event: new Types.ObjectId(eventId),
          initiator: new Types.ObjectId(initiatorId),
          collaborator: new Types.ObjectId(eventInvitation.collaborator._id!),
          status: "pending",
          deleted: false,
        } as Partial<IEventInvitation>);
      }
    );

    await Promise.all(createPromises);
  }
}

export default CreateEventInvitationsAction;
