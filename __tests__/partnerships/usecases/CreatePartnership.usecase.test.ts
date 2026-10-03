import { Types } from "mongoose";
import CreatePartnershipUseCase from "@src/application/usecases/partnerships/CreatePartnership.usecase";
import { Partnership } from "@src/domain/entities/Partnership.entity";
import { User } from "@src/domain/entities/User.entity";
import { IPartnershipNotifier } from "@src/domain/interfaces/IPartnershipNotifier";
import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { createMockUserRepository } from "../../helpers/mockUserRepository";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildUser = (id: string, userType: "creator" | "guest") =>
  User.reconstitute({
    id: UserId.from(id),
    email: "user@example.com",
    username: userType,
    userType,
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    preferences: UserPreferences.from({}),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe("CreatePartnershipUseCase", () => {
  let partnershipRepository: jest.Mocked<IPartnershipRepository>;
  let partnershipNotifier: jest.Mocked<IPartnershipNotifier>;
  let userRepository: jest.Mocked<IUserRepository>;
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
    userRepository = createMockUserRepository();
    userRepository.findById.mockImplementation(async (id) =>
      buildUser(id.toString(), "creator")
    );
    useCase = new CreatePartnershipUseCase(
      partnershipRepository,
      partnershipNotifier,
      userRepository
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

  it("rejects a collaboration sent to a guest", async () => {
    const initiatorId = mockObjectId();
    const collaboratorId = mockObjectId();
    userRepository.findById.mockResolvedValue(
      buildUser(collaboratorId, "guest")
    );

    await expect(
      useCase.execute({ collaboratorId, initiatorId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_COLLABORATOR_MUST_BE_CREATOR,
    });

    expect(partnershipRepository.save).not.toHaveBeenCalled();
    expect(partnershipNotifier.notifyInvitationCreated).not.toHaveBeenCalled();
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
