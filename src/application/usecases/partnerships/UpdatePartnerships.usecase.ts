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
import {
  UpdatePartnershipsInput,
  UpdatePartnershipItem,
} from "@src/application/dtos/partnerships/updatePartnerships.dto";

class UpdatePartnershipsUseCase {
  constructor(
    private readonly partnershipRepository: IPartnershipRepository
  ) {}

  async execute(params: UpdatePartnershipsInput): Promise<void> {
    const userId = UserId.from(params.userId);

    await Promise.all(
      params.partnerships.map((item) => this.updateOne(item, userId))
    );
  }

  private async updateOne(
    item: UpdatePartnershipItem,
    userId: UserId
  ): Promise<void> {
    const partnershipId = PartnershipId.from(item.id);
    const existing =
      await this.partnershipRepository.findById(partnershipId);

    if (!existing) {
      throw new NotFoundError(
        ERROR_CODES.PARTNERSHIP_NOT_FOUND,
        `Partnership ${item.id} not found`
      );
    }

    const isInitiator = existing.isInitiator(userId);
    const isCollaborator = existing.isCollaborator(userId);

    const isTryingToAccept =
      item.status === "accepted" && item.status !== existing.status;

    if (isTryingToAccept && !isCollaborator) {
      throw new ForbiddenError(
        ERROR_CODES.PARTNERSHIP_ACCEPT_FORBIDDEN,
        "Seul le collaborateur peut accepter l'invitation"
      );
    }

    if (!isInitiator && !isCollaborator) {
      throw new ForbiddenError(
        ERROR_CODES.PARTNERSHIP_UPDATE_FORBIDDEN,
        "You don't have permission to update this partnership"
      );
    }

    if (!item.status || item.status === existing.status) {
      return;
    }

    if (item.status === "accepted") {
      await this.partnershipRepository.update(existing.accept());
    }
  }
}

export default UpdatePartnershipsUseCase;
