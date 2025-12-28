import { IPartnershipRepository } from "../../repositories/partnerships/IPartnershipRepository";
import { IPartnership } from "../../types/models/partnership";

export interface UpdatePartnershipDTO {
  _id: string;
  deleted?: boolean;
  status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
}

export interface UpdatePartnershipsDTO {
  partnerships: UpdatePartnershipDTO[];
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
          throw new Error(`Partnership ${partnership._id} not found`);
        }

        const isInitiator = existingPartnership.initiator.toString() === userId;
        const isCollaborator =
          existingPartnership.collaborator.toString() === userId;

        let updateData: Partial<IPartnership> = {};

        if (isInitiator) {
          updateData.deleted = partnership.deleted;
        } else if (isCollaborator) {
          if (partnership.status) {
            updateData.status = partnership.status;
          }
        } else {
          throw new Error(
            "You don't have permission to update this partnership"
          );
        }

        await this.partnershipRepository.updateOne(partnership._id, updateData);
      }
    );

    await Promise.all(updatePromises);
  }
}

export default UpdatePartnershipsAction;
