import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import { PartnershipListItemReadModel } from "@src/domain/read-models/partnership.read-models";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetPartnershipsByUserIdInput } from "@src/application/dtos/partnerships/getPartnershipsByUserId.dto";

class GetPartnershipsByUserIdUseCase {
  constructor(
    private readonly partnershipRepository: IPartnershipRepository
  ) {}

  async execute(
    params: GetPartnershipsByUserIdInput
  ): Promise<PartnershipListItemReadModel[]> {
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
