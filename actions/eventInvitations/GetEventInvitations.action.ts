import {
  IEventInvitationRepository,
  EventInvitationFilters,
} from "@/types/repositories/eventInvitation.repository.types";
import { IEventInvitation } from "@/types/models/eventInvitation";

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

    const filteredInvitations = eventInvitations.filter((invitation: any) => {
      if (!filters.currentUserId || filters.onlyAccepted) {
        return invitation.status === "accepted";
      }
      const isInitiator =
        invitation.initiator &&
        (typeof invitation.initiator === "object"
          ? invitation.initiator._id?.toString()
          : invitation.initiator.toString()) === filters.currentUserId;
      const isCollaborator =
        invitation.collaborator &&
        (typeof invitation.collaborator === "object"
          ? invitation.collaborator._id?.toString()
          : invitation.collaborator.toString()) === filters.currentUserId;

      if (isInitiator || isCollaborator) {
        return true;
      }
      return invitation.status === "accepted";
    });

    return filteredInvitations as IEventInvitation[];
  }
}

export default GetEventInvitationsAction;
