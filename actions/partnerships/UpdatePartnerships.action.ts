import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { IPartnership } from "@/types/models/partnership";
import { ERROR_CODES, ForbiddenError, NotFoundError } from "@/utils/errors";

export interface UpdatePartnershipDTO {
  _id: string;
  status?: "pending" | "accepted";
}

export interface IUpdatePartnershipsAction {
  execute(params: {
    partnerships: UpdatePartnershipDTO[];
    userId: string;
  }): Promise<void>;
}

class UpdatePartnershipsAction implements IUpdatePartnershipsAction {
  constructor(private partnershipRepository: IPartnershipRepository) {}

  async execute({
    partnerships,
    userId,
  }: {
    partnerships: UpdatePartnershipDTO[];
    userId: string;
  }): Promise<void> {
    const updatePromises = partnerships.map(
      async (partnership: UpdatePartnershipDTO) => {
        const existingPartnership = await this.partnershipRepository.findById(
          partnership._id
        );

        if (!existingPartnership) {
          throw new NotFoundError(
            ERROR_CODES.PARTNERSHIP_NOT_FOUND,
            `Partnership ${partnership._id} not found`
          );
        }

        const isInitiator = existingPartnership.initiator.toString() === userId;
        const isCollaborator =
          existingPartnership.collaborator.toString() === userId;

        const isTryingToAccept =
          partnership.status === "accepted" &&
          partnership.status !== existingPartnership.status;

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

        if (!partnership.status) return;

        const updateData: Partial<IPartnership> = {
          status: partnership.status,
        };

        if (Object.keys(updateData).length > 0) {
          await this.partnershipRepository.updateOne(
            partnership._id,
            updateData
          );
        }
      }
    );

    await Promise.all(updatePromises);
  }
}

export default UpdatePartnershipsAction;
