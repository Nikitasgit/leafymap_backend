import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetEventInvitationsByUserIdInput } from "@src/application/dtos/eventInvitations/getEventInvitationsByUserId.dto";

class GetEventInvitationsByUserIdUseCase {
  constructor(
    private readonly eventInvitationRepository: IEventInvitationRepository
  ) {}

  async execute(
    params: GetEventInvitationsByUserIdInput
  ): Promise<Record<string, unknown>[]> {
    return this.eventInvitationRepository.findListForUser({
      userId: UserId.from(params.userId),
      asCollaborator: params.asCollaborator,
      includeCancelledEvents: params.includeCancelledEvents,
      includePastEvents: params.includePastEvents,
      currentUserId: params.currentUserId
        ? UserId.from(params.currentUserId)
        : undefined,
      onlyAccepted: params.onlyAccepted,
      onlyPending: params.onlyPending,
    });
  }
}

export default GetEventInvitationsByUserIdUseCase;
