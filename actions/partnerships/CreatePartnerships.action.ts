import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { IPartnership } from "@/types/models/partnership";
import { PartnershipDTO } from "@/types/api/partnership.dto";
import { Types } from "mongoose";
import NotificationService from "@/services/notificationService";
import {
  AppError,
  ConflictError,
  ERROR_CODES,
  ValidationError,
} from "@/utils/errors";

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
      throw new ValidationError(
        { collaborator: "Collaborator ID is required" },
        ERROR_CODES.PARTNERSHIP_COLLABORATOR_REQUIRED,
        "Collaborator ID is required"
      );
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
      throw new ConflictError(
        existingPartnership.status === "accepted"
          ? ERROR_CODES.PARTNERSHIP_ALREADY_EXISTS
          : ERROR_CODES.PARTNERSHIP_INVITATION_ALREADY_SENT,
        existingPartnership.status === "accepted"
          ? "Vous avez déjà une collaboration avec cet utilisateur"
          : "Invitation déjà envoyée"
      );
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
      throw new AppError(
        ERROR_CODES.PARTNERSHIP_CREATE_FAILED,
        500,
        "Failed to create partnership"
      );
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
