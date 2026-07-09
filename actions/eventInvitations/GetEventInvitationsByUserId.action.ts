import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { IEventInvitation } from "@/types/models/eventInvitation";

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
    "initiator.userCategory.name",
    "collaborator._id",
    "collaborator.username",
    "collaborator.image.urls",
    "collaborator.userCategory.name",
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
    return this.eventInvitationRepository.findAllForUser({
      filters,
      project: this.project,
      sort: { updatedAt: -1 },
    });
  }
}

export default GetEventInvitationsByUserIdAction;
