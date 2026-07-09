import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { ERROR_CODES, ForbiddenError, NotFoundError } from "@/utils/errors";

export interface IDeletePartnershipAction {
  execute(params: { partnershipId: string; userId: string }): Promise<void>;
}

class DeletePartnershipAction implements IDeletePartnershipAction {
  constructor(private partnershipRepository: IPartnershipRepository) {}

  async execute({
    partnershipId,
    userId,
  }: {
    partnershipId: string;
    userId: string;
  }): Promise<void> {
    const existingPartnership = await this.partnershipRepository.findById(
      partnershipId
    );

    if (!existingPartnership) {
      throw new NotFoundError(
        ERROR_CODES.PARTNERSHIP_NOT_FOUND,
        `Partnership ${partnershipId} not found`
      );
    }

    const isInitiator = existingPartnership.initiator.toString() === userId;
    const isCollaborator =
      existingPartnership.collaborator.toString() === userId;

    if (!isInitiator && !isCollaborator) {
      throw new ForbiddenError(
        ERROR_CODES.PARTNERSHIP_DELETE_FORBIDDEN,
        "You don't have permission to delete this partnership"
      );
    }

    await this.partnershipRepository.deleteOne(partnershipId);
  }
}

export default DeletePartnershipAction;
