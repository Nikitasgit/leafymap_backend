import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { IEventInvitation } from "@/types/models/eventInvitation";

export interface UpdateEventInvitationDTO {
  _id: string;
  deleted?: boolean;
  status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
}

export interface UpdateEventInvitationsDTO {
  eventInvitations: UpdateEventInvitationDTO[];
}

export interface IUpdateEventInvitationAction {
  execute(params: {
    eventInvitations: UpdateEventInvitationDTO[];
    userId: string;
  }): Promise<void>;
}

class UpdateEventInvitationAction implements IUpdateEventInvitationAction {
  constructor(private eventInvitationRepository: IEventInvitationRepository) {}

  async execute({
    eventInvitations,
    userId,
  }: {
    eventInvitations: UpdateEventInvitationDTO[];
    userId: string;
  }): Promise<void> {
    const updatePromises = eventInvitations.map(
      async (eventInvitation: UpdateEventInvitationDTO) => {
        const existingInvitation =
          await this.eventInvitationRepository.findById(eventInvitation._id);

        if (!existingInvitation) {
          throw new Error(`Event invitation ${eventInvitation._id} not found`);
        }

        const isInitiator = existingInvitation.initiator.toString() === userId;
        const isCollaborator =
          existingInvitation.collaborator.toString() === userId;

        const isTryingToAcceptOrRefuse =
          (eventInvitation.status === "accepted" ||
            eventInvitation.status === "refused") &&
          eventInvitation.status !== existingInvitation.status;

        if (isTryingToAcceptOrRefuse && !isCollaborator) {
          throw new Error(
            "Seul le collaborateur peut accepter ou refuser l'invitation"
          );
        }

        if (!isInitiator && !isCollaborator) {
          throw new Error(
            "You don't have permission to update this event invitation"
          );
        }

        let updateData: Partial<IEventInvitation> = {};

        if (isInitiator) {
          if (eventInvitation.deleted) {
            updateData.deleted = true;
            updateData.status = "cancelled";
          } else if (eventInvitation.deleted === false) {
            updateData.deleted = false;
          }
        }
        if (isCollaborator) {
          if (eventInvitation.status) {
            updateData.status = eventInvitation.status;
          }
        }

        await this.eventInvitationRepository.updateOne(
          eventInvitation._id,
          updateData
        );
      }
    );

    await Promise.all(updatePromises);
  }
}

export default UpdateEventInvitationAction;
