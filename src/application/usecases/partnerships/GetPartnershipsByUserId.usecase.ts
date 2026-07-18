import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { PartnershipStatus } from "@src/domain/value-objects/PartnershipStatus.vo";

export interface IGetPartnershipsByUserIdUseCase {
  execute(params: {
    userId: string;
    asCollaborator?: boolean;
    asInitiator?: boolean;
    status?: PartnershipStatus;
    currentUserId?: string;
  }): Promise<Record<string, unknown>[]>;
}

class GetPartnershipsByUserIdUseCase
  implements IGetPartnershipsByUserIdUseCase
{
  constructor(
    private readonly partnershipRepository: IPartnershipRepository
  ) {}

  async execute(params: {
    userId: string;
    asCollaborator?: boolean;
    asInitiator?: boolean;
    status?: PartnershipStatus;
    currentUserId?: string;
  }): Promise<Record<string, unknown>[]> {
    return this.partnershipRepository.findListForUser({
      userId: UserId.from(params.userId),
      asCollaborator: params.asCollaborator,
      asInitiator: params.asInitiator,
      status: params.status,
      currentUserId: params.currentUserId
        ? UserId.from(params.currentUserId)
        : undefined,
    });
  }
}

export default GetPartnershipsByUserIdUseCase;
