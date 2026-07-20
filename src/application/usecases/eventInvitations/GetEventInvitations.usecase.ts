import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { EventInvitationListItemReadModel } from "@src/domain/read-models/eventInvitation.read-models";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetEventInvitationsInput } from "@src/application/dtos/eventInvitations/getEventInvitations.dto";

const getParticipantId = (
  participant: unknown
): string | undefined => {
  if (typeof participant === "string") {
    return participant;
  }
  if (participant && typeof participant === "object") {
    const record = participant as {
      id?: { toString(): string } | string;
    };
    const rawId = record.id;
    if (rawId) {
      return typeof rawId === "string" ? rawId : rawId.toString();
    }
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

class GetEventInvitationsUseCase {
  constructor(
    private readonly eventInvitationRepository: IEventInvitationRepository
  ) {}

  async execute(
    params: GetEventInvitationsInput
  ): Promise<EventInvitationListItemReadModel[]> {
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
