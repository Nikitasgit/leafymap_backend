import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";

const getParticipantId = (
  participant: unknown
): string | undefined => {
  if (typeof participant === "string") {
    return participant;
  }
  if (
    participant &&
    typeof participant === "object" &&
    "_id" in participant &&
    (participant as { _id?: { toString(): string } | string })._id
  ) {
    const id = (participant as { _id: { toString(): string } | string })._id;
    return typeof id === "string" ? id : id.toString();
  }
  if (
    participant &&
    typeof participant === "object" &&
    "toString" in participant
  ) {
    return (participant as { toString(): string }).toString();
  }
  return undefined;
};

export interface IGetEventInvitationsUseCase {
  execute(params: {
    eventId: string;
    currentUserId?: string;
    onlyAccepted?: boolean;
  }): Promise<Record<string, unknown>[]>;
}

class GetEventInvitationsUseCase implements IGetEventInvitationsUseCase {
  constructor(
    private readonly eventInvitationRepository: IEventInvitationRepository
  ) {}

  async execute(params: {
    eventId: string;
    currentUserId?: string;
    onlyAccepted?: boolean;
  }): Promise<Record<string, unknown>[]> {
    const eventId = EventId.from(params.eventId);
    const invitations =
      await this.eventInvitationRepository.findListByEvent(eventId);

    const currentUserId = params.currentUserId
      ? UserId.from(params.currentUserId)
      : undefined;

    return invitations.filter((invitation) => {
      if (!currentUserId || params.onlyAccepted) {
        return invitation.status === "accepted";
      }

      const isInitiator =
        getParticipantId(invitation.initiator) === currentUserId;
      const isCollaborator =
        getParticipantId(invitation.collaborator) === currentUserId;

      if (isInitiator || isCollaborator) {
        return true;
      }
      return invitation.status === "accepted";
    });
  }
}

export default GetEventInvitationsUseCase;
