import { Partnership } from "@src/domain/entities/Partnership.entity";
import { IPartnershipNotifier } from "@src/domain/interfaces/IPartnershipNotifier";
import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  AppError,
  ConflictError,
  ERROR_CODES,
  ValidationError,
} from "@src/shared/errors";
import { CreatePartnershipInput } from "@src/application/dtos/partnerships/createPartnership.dto";

class CreatePartnershipUseCase {
  constructor(
    private readonly partnershipRepository: IPartnershipRepository,
    private readonly partnershipNotifier: IPartnershipNotifier
  ) {}

  async execute(params: CreatePartnershipInput): Promise<Partnership> {
    if (!params.collaboratorId) {
      throw new ValidationError(
        { collaborator: "Collaborator ID is required" },
        ERROR_CODES.PARTNERSHIP_COLLABORATOR_REQUIRED,
        "Collaborator ID is required"
      );
    }

    const initiatorId = UserId.from(params.initiatorId);
    const collaboratorId = UserId.from(params.collaboratorId);

    const existing =
      await this.partnershipRepository.findExistingBetweenUsers(
        initiatorId,
        collaboratorId
      );

    if (existing) {
      throw new ConflictError(
        existing.status === "accepted"
          ? ERROR_CODES.PARTNERSHIP_ALREADY_EXISTS
          : ERROR_CODES.PARTNERSHIP_INVITATION_ALREADY_SENT,
        existing.status === "accepted"
          ? "Vous avez déjà une collaboration avec cet utilisateur"
          : "Invitation déjà envoyée"
      );
    }

    const partnership = Partnership.create({
      initiatorId,
      collaboratorId,
    });

    const partnershipId = await this.partnershipRepository.save(partnership);
    const created = await this.partnershipRepository.findById(partnershipId);

    if (!created) {
      throw new AppError(
        ERROR_CODES.PARTNERSHIP_CREATE_FAILED,
        "Failed to create partnership"
      );
    }

    await this.partnershipNotifier.notifyInvitationCreated({
      senderId: initiatorId,
      receiverId: collaboratorId,
      partnershipId,
    });

    return created;
  }
}

export default CreatePartnershipUseCase;
