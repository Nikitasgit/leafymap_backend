import {
  IEventInvitationRepository,
  EventInvitationFilters,
} from "@/types/repositories/eventInvitation.repository.types";
import { IEventInvitation } from "@/types/models/eventInvitation";
import { IUser } from "@/types/models/user";
import { Types } from "mongoose";

const getParticipantId = (
  participant: Types.ObjectId | Partial<IUser>
): string | undefined => {
  if (participant instanceof Types.ObjectId) {
    return participant.toString();
  }
  return participant._id?.toString();
};

export interface GetEventInvitationsInput {
  eventId: string;
  currentUserId?: string;
  onlyAccepted?: boolean;
}

export interface IGetEventInvitationsAction {
  execute(params: {
    filters: GetEventInvitationsInput;
  }): Promise<IEventInvitation[]>;
}

class GetEventInvitationsAction implements IGetEventInvitationsAction {
  private readonly project: (keyof IEventInvitation | string)[] = [
    "_id",
    "initiator",
    "collaborator",
    "status",
    "deleted",
    "initiator._id",
    "collaborator._id",
    "collaborator.username",
    "collaborator.userCategory",
    "collaborator.image",
    "collaborator.deleted",
    "collaborator.image.urls",
    "collaborator.googlePictureUrl",
    "collaborator.userCategory.name",
  ];

  constructor(private eventInvitationRepository: IEventInvitationRepository) {}

  async execute({
    filters,
  }: {
    filters: GetEventInvitationsInput;
  }): Promise<IEventInvitation[]> {
    const queryFilters: EventInvitationFilters = {
      event: filters.eventId,
      deleted: false,
    };

    const eventInvitations = await this.eventInvitationRepository.findAll({
      filters: queryFilters,
      project: this.project,
    });

    const filteredInvitations = eventInvitations.filter((invitation) => {
      if (!filters.currentUserId || filters.onlyAccepted) {
        return invitation.status === "accepted";
      }
      const isInitiator =
        invitation.initiator &&
        getParticipantId(invitation.initiator) === filters.currentUserId;
      const isCollaborator =
        invitation.collaborator &&
        getParticipantId(invitation.collaborator) === filters.currentUserId;

      if (isInitiator || isCollaborator) {
        return true;
      }
      return invitation.status === "accepted";
    });

    return filteredInvitations as IEventInvitation[];
  }
}

export default GetEventInvitationsAction;
