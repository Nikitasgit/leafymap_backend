import { Types } from "mongoose";
import UpdatePartnershipsUseCase from "@src/application/usecases/partnerships/UpdatePartnerships.usecase";
import { Partnership } from "@src/domain/entities/Partnership.entity";
import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("UpdatePartnershipsUseCase", () => {
  let partnershipRepository: jest.Mocked<IPartnershipRepository>;
  let useCase: UpdatePartnershipsUseCase;

  const initiatorId = mockObjectId();
  const collaboratorId = mockObjectId();
  const partnershipId = mockObjectId();

  const pendingPartnership = () =>
    Partnership.reconstitute({
      id: PartnershipId.from(partnershipId),
      initiatorId: UserId.from(initiatorId),
      collaboratorId: UserId.from(collaboratorId),
      status: "pending",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    partnershipRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findExistingBetweenUsers: jest.fn(),
      findListForUser: jest.fn(),
      deleteManyByUserId: jest.fn(),
    };
    useCase = new UpdatePartnershipsUseCase(partnershipRepository);
  });

  it("allows the collaborator to accept a partnership", async () => {
    partnershipRepository.findById.mockResolvedValue(pendingPartnership());

    await useCase.execute({
      userId: collaboratorId,
      partnerships: [{ id: partnershipId, status: "accepted" }],
    });

    expect(partnershipRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "accepted" })
    );
  });

  it("forbids the initiator from accepting", async () => {
    partnershipRepository.findById.mockResolvedValue(pendingPartnership());

    await expect(
      useCase.execute({
        userId: initiatorId,
        partnerships: [{ id: partnershipId, status: "accepted" }],
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_ACCEPT_FORBIDDEN,
    });

    expect(partnershipRepository.update).not.toHaveBeenCalled();
  });

  it("rejects when a third party tries to update the partnership", async () => {
    partnershipRepository.findById.mockResolvedValue(pendingPartnership());

    await expect(
      useCase.execute({
        userId: mockObjectId(),
        partnerships: [{ id: partnershipId, status: "pending" }],
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_UPDATE_FORBIDDEN,
    });

    expect(partnershipRepository.update).not.toHaveBeenCalled();
  });

  it("rejects when the partnership does not exist", async () => {
    partnershipRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: collaboratorId,
        partnerships: [{ id: partnershipId, status: "accepted" }],
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_NOT_FOUND,
    });
  });
});
