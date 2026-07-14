import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { IEventInvitation } from "@/types/models/eventInvitation";
import NotificationService from "@/services/notificationService";
import EventInvitationService from "@/services/eventInvitationService";
import { ERROR_CODES, ForbiddenError, NotFoundError } from "@/utils/errors";

export interface UpdateEventInvitationDTO {
  _id: string;
  deleted?: boolean;
  status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
}

export interface IUpdateEventInvitationAction {
  execute(params: {
    eventInvitations: UpdateEventInvitationDTO[];
    userId: string;
  }): Promise<void>;
}

class UpdateEventInvitationAction implements IUpdateEventInvitationAction {
  constructor(
    private eventInvitationRepository: IEventInvitationRepository,
    private notificationService: NotificationService,
    private eventInvitationService: EventInvitationService
  ) {}

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
          throw new NotFoundError(
            ERROR_CODES.EVENT_INVITATION_NOT_FOUND,
            `Event invitation ${eventInvitation._id} not found`
          );
        }

        const isInitiator = existingInvitation.initiator.toString() === userId;
        const isCollaborator =
          existingInvitation.collaborator.toString() === userId;

        const isTryingToAcceptOrRefuse =
          (eventInvitation.status === "accepted" ||
            eventInvitation.status === "refused") &&
          eventInvitation.status !== existingInvitation.status;

        if (isTryingToAcceptOrRefuse && !isCollaborator) {
          throw new ForbiddenError(
            ERROR_CODES.EVENT_INVITATION_RESPOND_FORBIDDEN,
            "Seul le collaborateur peut accepter ou refuser l'invitation"
          );
        }

        if (!isInitiator && !isCollaborator) {
          throw new ForbiddenError(
            ERROR_CODES.EVENT_INVITATION_UPDATE_FORBIDDEN,
            "You don't have permission to update this event invitation"
          );
        }

        const updateData: Partial<IEventInvitation> = {};

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

        const isRefusedOrCancelled =
          (eventInvitation.status === "refused" &&
            eventInvitation.status !== existingInvitation.status) ||
          (eventInvitation.status === "cancelled" &&
            eventInvitation.status !== existingInvitation.status) ||
          (isInitiator && eventInvitation.deleted === true);

        if (isRefusedOrCancelled) {
          if (isCollaborator) {
            const initiatorId = existingInvitation.initiator.toString();
            const eventId = existingInvitation.event.toString();

            if (eventInvitation.status === "refused") {
              await this.notificationService.createNotification({
                sender: userId,
                receiver: initiatorId,
                action: "event_refused",
                reference: eventId,
                referenceType: "Event",
              });
            } else if (
              eventInvitation.status === "cancelled" &&
              existingInvitation.status === "accepted"
            ) {
              await this.notificationService.createNotification({
                sender: userId,
                receiver: initiatorId,
                action: "event_refused",
                reference: eventId,
                referenceType: "Event",
              });
            }
          }
          await this.eventInvitationService.deleteEventInvitation(
            eventInvitation._id
          );
          return;
        }

        await this.eventInvitationRepository.updateOne(
          eventInvitation._id,
          updateData
        );

        if (
          isCollaborator &&
          eventInvitation.status === "accepted" &&
          eventInvitation.status !== existingInvitation.status
        ) {
          const initiatorId = existingInvitation.initiator.toString();
          const eventId = existingInvitation.event.toString();
          await this.notificationService.createNotification({
            sender: userId,
            receiver: initiatorId,
            action: "event_accepted",
            reference: eventId,
            referenceType: "Event",
          });
        }
      }
    );

    await Promise.all(updatePromises);
  }
}

export default UpdateEventInvitationAction;
