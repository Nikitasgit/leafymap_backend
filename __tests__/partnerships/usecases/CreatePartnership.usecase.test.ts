import { Types } from "mongoose";
import CreatePartnershipUseCase from "@src/application/usecases/partnerships/CreatePartnership.usecase";
import { Partnership } from "@src/domain/entities/Partnership.entity";
import { IPartnershipNotifier } from "@src/domain/interfaces/IPartnershipNotifier";
import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("CreatePartnershipUseCase", () => {
  let partnershipRepository: jest.Mocked<IPartnershipRepository>;
  let partnershipNotifier: jest.Mocked<IPartnershipNotifier>;
  let useCase: CreatePartnershipUseCase;

  beforeEach(() => {
    partnershipRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findExistingBetweenUsers: jest.fn(),
      findListForUser: jest.fn(),
      deleteManyByUserId: jest.fn(),
    };
    partnershipNotifier = {
      notifyInvitationCreated: jest.fn(),
    };
    useCase = new CreatePartnershipUseCase(
      partnershipRepository,
      partnershipNotifier
    );
  });

  it("creates a partnership and notifies the collaborator", async () => {
    const initiatorId = mockObjectId();
    const collaboratorId = mockObjectId();
    const partnershipId = PartnershipId.from(mockObjectId());
    const created = Partnership.reconstitute({
      id: partnershipId,
      initiatorId: UserId.from(initiatorId),
      collaboratorId: UserId.from(collaboratorId),
      status: "pending",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    partnershipRepository.findExistingBetweenUsers.mockResolvedValue(null);
    partnershipRepository.save.mockResolvedValue(partnershipId);
    partnershipRepository.findById.mockResolvedValue(created);

    const result = await useCase.execute({
      collaboratorId,
      initiatorId,
    });

    expect(result).toEqual(created);
    expect(partnershipRepository.save).toHaveBeenCalled();
    expect(partnershipNotifier.notifyInvitationCreated).toHaveBeenCalledWith({
      senderId: UserId.from(initiatorId),
      receiverId: UserId.from(collaboratorId),
      partnershipId,
    });
  });

  it("rejects when an accepted partnership already exists", async () => {
    const initiatorId = mockObjectId();
    const collaboratorId = mockObjectId();

    partnershipRepository.findExistingBetweenUsers.mockResolvedValue(
      Partnership.reconstitute({
        id: PartnershipId.from(mockObjectId()),
        initiatorId: UserId.from(initiatorId),
        collaboratorId: UserId.from(collaboratorId),
        status: "accepted",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await expect(
      useCase.execute({ collaboratorId, initiatorId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_ALREADY_EXISTS,
    });

    expect(partnershipRepository.save).not.toHaveBeenCalled();
    expect(partnershipNotifier.notifyInvitationCreated).not.toHaveBeenCalled();
  });

  it("rejects when a pending invitation was already sent", async () => {
    const initiatorId = mockObjectId();
    const collaboratorId = mockObjectId();

    partnershipRepository.findExistingBetweenUsers.mockResolvedValue(
      Partnership.reconstitute({
        id: PartnershipId.from(mockObjectId()),
        initiatorId: UserId.from(initiatorId),
        collaboratorId: UserId.from(collaboratorId),
        status: "pending",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await expect(
      useCase.execute({ collaboratorId, initiatorId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_INVITATION_ALREADY_SENT,
    });

    expect(partnershipRepository.save).not.toHaveBeenCalled();
    expect(partnershipNotifier.notifyInvitationCreated).not.toHaveBeenCalled();
  });
});
