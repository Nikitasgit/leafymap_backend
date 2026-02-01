import {
  IEventInvitationRepository,
  EventInvitationFilters,
} from "@/types/repositories/eventInvitation.repository.types";
import { IEventInvitation } from "@/types/models/eventInvitation";
import { IEvent } from "@/types/models";

export interface GetEventInvitationsByUserIdInput {
  userId: string;
  asCollaborator?: boolean;
  includeCancelledEvents?: boolean;
  includePastEvents?: boolean;
  currentUserId?: string;
  onlyAccepted?: boolean;
  onlyPending?: boolean;
}

export interface IGetEventInvitationsByUserIdAction {
  execute(params: {
    filters: GetEventInvitationsByUserIdInput;
  }): Promise<IEventInvitation[]>;
}

class GetEventInvitationsByUserIdAction
  implements IGetEventInvitationsByUserIdAction
{
  private readonly project: (keyof IEventInvitation | string)[] = [
    "_id",
    "initiator",
    "collaborator",
    "status",
    "deleted",
    "updatedAt",
    "initiator._id",
    "initiator.username",
    "initiator.image.urls",
    "collaborator._id",
    "collaborator.username",
    "collaborator.image.urls",
    "collaborator.userCategories.name",
    "event._id",
    "event.name",
    "event.description",
    "event.image",
    "event.schedule",
    "event.status",
    "event.lifecycleStatus",
    "event.dateRange",
    "event.image.urls",
  ];

  constructor(private eventInvitationRepository: IEventInvitationRepository) {}

  async execute({
    filters,
  }: {
    filters: GetEventInvitationsByUserIdInput;
  }): Promise<IEventInvitation[]> {
    const queryFilters: EventInvitationFilters = {
      deleted: false,
    };

    if (filters.asCollaborator) {
      queryFilters.collaborator = filters.userId;
    } else {
      queryFilters.initiator = filters.userId;
    }

    if (filters.onlyPending) {
      queryFilters.status = "pending";
    }

    const eventInvitations = await this.eventInvitationRepository.findAll({
      filters: queryFilters,
      project: this.project,
      sort: { updatedAt: -1 },
    });

    const filteredInvitations = eventInvitations.filter((invitation: any) => {
      if (filters.onlyPending) {
        return true;
      }
      if (filters.onlyAccepted) {
        return invitation.status === "accepted";
      }

      if (!filters.currentUserId) {
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

    let validInvitations = filteredInvitations.filter((invitation: any) => {
      if (!invitation.event) {
        return false;
      }
      return true;
    });

    if (filters.includeCancelledEvents !== true) {
      validInvitations = validInvitations.filter((invitation: any) => {
        if (!invitation.event) {
          return true;
        }
        const event = invitation.event as Partial<IEvent>;
        return event.status !== "cancelled";
      });
    }

    if (filters.includePastEvents !== true) {
      validInvitations = validInvitations.filter((invitation: any) => {
        if (!invitation.event) {
          return true;
        }
        const event = invitation.event as IEvent;
        if (!event.lifecycleStatus) {
          return true;
        }
        return (
          event.lifecycleStatus === "ongoing" ||
          event.lifecycleStatus === "upcoming"
        );
      });
    }

    return validInvitations as IEventInvitation[];
  }
}

export default GetEventInvitationsByUserIdAction;
