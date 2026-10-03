import { Partnership } from "@src/domain/entities/Partnership.entity";
import { IPartnershipNotifier } from "@src/domain/interfaces/IPartnershipNotifier";
import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  AppError,
  ConflictError,
  ERROR_CODES,
  NotFoundError,
  ValidationError,
} from "@src/shared/errors";
import { CreatePartnershipInput } from "@src/application/dtos/partnerships/createPartnership.dto";

class CreatePartnershipUseCase {
  constructor(
    private readonly partnershipRepository: IPartnershipRepository,
    private readonly partnershipNotifier: IPartnershipNotifier,
    private readonly userRepository: IUserRepository
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

    const collaborator = await this.userRepository.findById(collaboratorId);
    if (!collaborator || collaborator.deleted) {
      throw new NotFoundError(
        ERROR_CODES.USER_NOT_FOUND,
        "Collaborator not found"
      );
    }
    if (collaborator.userType !== "creator") {
      throw new ValidationError(
        { collaborator: "Only creators can be invited" },
        ERROR_CODES.PARTNERSHIP_COLLABORATOR_MUST_BE_CREATOR,
        "Only creators can receive a collaboration invitation"
      );
    }

    const existing = await this.partnershipRepository.findExistingBetweenUsers(
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
