import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";
import { DeletePartnershipInput } from "@src/application/dtos/partnerships/deletePartnership.dto";

class DeletePartnershipUseCase {
  constructor(
    private readonly partnershipRepository: IPartnershipRepository
  ) {}

  async execute(params: DeletePartnershipInput): Promise<void> {
    const partnershipId = PartnershipId.from(params.partnershipId);
    const userId = UserId.from(params.userId);

    const existing =
      await this.partnershipRepository.findById(partnershipId);

    if (!existing) {
      throw new NotFoundError(
        ERROR_CODES.PARTNERSHIP_NOT_FOUND,
        `Partnership ${params.partnershipId} not found`
      );
    }

    if (!existing.isParticipant(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.PARTNERSHIP_DELETE_FORBIDDEN,
        "You don't have permission to delete this partnership"
      );
    }

    await this.partnershipRepository.update(existing.cancel());
  }
}

export default DeletePartnershipUseCase;
