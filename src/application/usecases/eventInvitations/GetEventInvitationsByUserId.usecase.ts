import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IGetEventInvitationsByUserIdUseCase {
  execute(params: {
    userId: string;
    asCollaborator?: boolean;
    includeCancelledEvents?: boolean;
    includePastEvents?: boolean;
    currentUserId?: string;
    onlyAccepted?: boolean;
    onlyPending?: boolean;
  }): Promise<Record<string, unknown>[]>;
}

class GetEventInvitationsByUserIdUseCase
  implements IGetEventInvitationsByUserIdUseCase
{
  constructor(
    private readonly eventInvitationRepository: IEventInvitationRepository
  ) {}

  async execute(params: {
    userId: string;
    asCollaborator?: boolean;
    includeCancelledEvents?: boolean;
    includePastEvents?: boolean;
    currentUserId?: string;
    onlyAccepted?: boolean;
    onlyPending?: boolean;
  }): Promise<Record<string, unknown>[]> {
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
