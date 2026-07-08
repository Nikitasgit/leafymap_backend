import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { IPartnership } from "@/types/models/partnership";
import { PartnershipDTO } from "@/types/api/partnership.dto";
import { Types } from "mongoose";
import NotificationService from "@/services/notificationService";

export interface ICreatePartnershipsAction {
  execute(params: {
    partnership: PartnershipDTO;
    initiatorId: string;
  }): Promise<IPartnership>;
}

class CreatePartnershipsAction implements ICreatePartnershipsAction {
  constructor(
    private partnershipRepository: IPartnershipRepository,
    private notificationService: NotificationService
  ) {}

  async execute({
    partnership,
    initiatorId,
  }: {
    partnership: PartnershipDTO;
    initiatorId: string;
  }): Promise<IPartnership> {
    const collaboratorId = partnership.collaborator._id;
    if (!collaboratorId) {
      throw new Error("Collaborator ID is required");
    }

    const initiatorObjectId = new Types.ObjectId(initiatorId);
    const collaboratorObjectId = new Types.ObjectId(collaboratorId);

    const existingPartnership = await this.partnershipRepository.findOne({
      deleted: false,
      $or: [
        {
          initiator: initiatorObjectId,
          collaborator: collaboratorObjectId,
        },
        {
          initiator: collaboratorObjectId,
          collaborator: initiatorObjectId,
        },
      ],
    } as any);

    if (existingPartnership) {
      const message =
        existingPartnership.status === "accepted"
          ? "Vous avez déjà une collaboration avec cet utilisateur"
          : "Invitation déjà envoyée";
      const error = new Error(message) as Error & { statusCode?: number };
      error.statusCode = 409;
      throw error;
    }

    const partnershipId = await this.partnershipRepository.create({
      initiator: initiatorObjectId,
      collaborator: collaboratorObjectId,
      status: "pending",
      deleted: false,
    } as Partial<IPartnership>);

    const newPartnership = await this.partnershipRepository.findById(
      partnershipId.toString()
    );

    if (!newPartnership) {
      throw new Error("Failed to create partnership");
    }

    await this.notificationService.createNotification({
      sender: initiatorId,
      receiver: collaboratorId,
      action: "partnership_invitation",
      reference: partnershipId.toString(),
      referenceType: "Partnership",
    });

    return newPartnership;
  }
}

export default CreatePartnershipsAction;
