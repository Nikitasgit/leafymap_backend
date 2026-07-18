import { EventInvitation } from "@src/domain/entities/EventInvitation.entity";
import { IEventInvitationNotifier } from "@src/domain/interfaces/IEventInvitationNotifier";
import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventInvitationStatus } from "@src/domain/value-objects/EventInvitationStatus.vo";
import {
  EventInvitationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

export interface UpdateEventInvitationItem {
  id: string;
  deleted?: boolean;
  status?: EventInvitationStatus;
}

export interface IUpdateEventInvitationUseCase {
  execute(params: {
    invitations: UpdateEventInvitationItem[];
    userId: string;
  }): Promise<void>;
}

class UpdateEventInvitationUseCase implements IUpdateEventInvitationUseCase {
  constructor(
    private readonly eventInvitationRepository: IEventInvitationRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventInvitationNotifier: IEventInvitationNotifier
  ) {}

  async execute(params: {
    invitations: UpdateEventInvitationItem[];
    userId: string;
  }): Promise<void> {
    const userId = UserId.from(params.userId);

    await Promise.all(
      params.invitations.map((item) => this.updateOne(item, userId))
    );
  }

  private async updateOne(
    item: UpdateEventInvitationItem,
    userId: UserId
  ): Promise<void> {
    const invitationId = EventInvitationId.from(item.id);
    const existing =
      await this.eventInvitationRepository.findById(invitationId);

    if (!existing) {
      throw new NotFoundError(
        ERROR_CODES.EVENT_INVITATION_NOT_FOUND,
        `Event invitation ${item.id} not found`
      );
    }

    const isInitiator = existing.isInitiator(userId);
    const isCollaborator = existing.isCollaborator(userId);

    const isTryingToAcceptOrRefuse =
      (item.status === "accepted" || item.status === "refused") &&
      item.status !== existing.status;

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

    const previousStatus = existing.status;
    let next = existing;

    if (isInitiator) {
      if (item.deleted === true) {
        next = next.cancel();
      } else if (item.deleted === false) {
        next = next.restore();
      }
    }

    if (isCollaborator && item.status) {
      if (item.status === "accepted" && previousStatus !== "accepted") {
        next = next.accept();
      } else if (item.status === "refused" && previousStatus !== "refused") {
        next = next.refuse();
      } else if (
        item.status === "cancelled" &&
        previousStatus !== "cancelled"
      ) {
        next = next.cancel();
      }
    }

    const isRefusedOrCancelled =
      (item.status === "refused" && item.status !== previousStatus) ||
      (item.status === "cancelled" && item.status !== previousStatus) ||
      (isInitiator && item.deleted === true);

    if (isRefusedOrCancelled) {
      if (isCollaborator) {
        if (item.status === "refused") {
          await this.eventInvitationNotifier.notifyRefused({
            senderId: userId,
            receiverId: existing.initiatorId,
            eventId: existing.eventId,
          });
        } else if (
          item.status === "cancelled" &&
          previousStatus === "accepted"
        ) {
          await this.eventInvitationNotifier.notifyRefused({
            senderId: userId,
            receiverId: existing.initiatorId,
            eventId: existing.eventId,
          });
        }
      }

      await this.removeInvitationAndCollaborator(invitationId, existing);
      return;
    }

    await this.eventInvitationRepository.update(next);

    if (
      isCollaborator &&
      item.status === "accepted" &&
      item.status !== previousStatus
    ) {
      await this.eventInvitationNotifier.notifyAccepted({
        senderId: userId,
        receiverId: existing.initiatorId,
        eventId: existing.eventId,
      });
    }
  }

  private async removeInvitationAndCollaborator(
    invitationId: EventInvitationId,
    invitation: EventInvitation
  ): Promise<void> {
    await this.eventInvitationRepository.delete(invitationId);

    const schedule = await this.eventRepository.findScheduleById(
      invitation.eventId
    );
    if (!schedule || schedule.length === 0) {
      return;
    }

    const collaboratorId = invitation.collaboratorId.toString();
    const updatedSchedule = schedule.map((period) => ({
      ...period,
      timeSlots: (period.timeSlots ?? []).map((slot) => ({
        ...slot,
        collaboratorIds: (slot.collaboratorIds ?? []).filter(
          (id) => id !== collaboratorId
        ),
      })),
    }));

    await this.eventRepository.updateSchedule(
      invitation.eventId,
      updatedSchedule
    );
  }
}

export default UpdateEventInvitationUseCase;
