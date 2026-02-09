import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { IEventInvitation } from "@/types/models/eventInvitation";
import { EventInvitationDTO } from "@/types/api/eventInvitation.dto";
import { Types } from "mongoose";
import NotificationService from "@/services/notificationService";

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
  constructor(
    private eventInvitationRepository: IEventInvitationRepository,
    private notificationService: NotificationService
  ) {}

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

        const collaboratorId = eventInvitation.collaborator._id;

        if (!collaboratorId) {
          return;
        }

        await this.eventInvitationRepository.create({
          event: new Types.ObjectId(eventId),
          initiator: new Types.ObjectId(initiatorId),
          collaborator: new Types.ObjectId(collaboratorId),
          status: "pending",
          deleted: false,
        } as Partial<IEventInvitation>);

        await this.notificationService.createNotification({
          sender: initiatorId,
          receiver: collaboratorId,
          action: "event_invitation",
          reference: eventId,
          referenceType: "Event",
        });
      }
    );

    await Promise.all(createPromises);
  }
}

export default CreateEventInvitationsAction;
