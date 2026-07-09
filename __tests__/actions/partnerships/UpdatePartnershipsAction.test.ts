import { Types } from "mongoose";
import UpdatePartnershipsAction from "@/actions/partnerships/UpdatePartnerships.action";
import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import {
  buildPartnership,
  createMockRepository,
  mockObjectId,
} from "../../helpers/mockRepositories";

describe("UpdatePartnershipsAction", () => {
  let partnershipRepository: jest.Mocked<IPartnershipRepository>;
  let action: UpdatePartnershipsAction;

  beforeEach(() => {
    partnershipRepository = createMockRepository<IPartnershipRepository>();
    action = new UpdatePartnershipsAction(partnershipRepository);
  });

  it("allows the collaborator to accept a partnership", async () => {
    const partnershipId = mockObjectId();
    const collaboratorId = mockObjectId();
    const initiatorId = mockObjectId();

    partnershipRepository.findById.mockResolvedValue(
      buildPartnership({
        _id: new Types.ObjectId(partnershipId),
        initiator: new Types.ObjectId(initiatorId),
        collaborator: new Types.ObjectId(collaboratorId),
        status: "pending",
      }) as never
    );

    await action.execute({
      partnerships: [{ _id: partnershipId, status: "accepted" }],
      userId: collaboratorId,
    });

    expect(partnershipRepository.updateOne).toHaveBeenCalledWith(partnershipId, {
      status: "accepted",
    });
  });

  it("rejects when the initiator tries to accept the invitation", async () => {
    const partnershipId = mockObjectId();
    const initiatorId = mockObjectId();
    const collaboratorId = mockObjectId();

    partnershipRepository.findById.mockResolvedValue(
      buildPartnership({
        _id: new Types.ObjectId(partnershipId),
        initiator: new Types.ObjectId(initiatorId),
        collaborator: new Types.ObjectId(collaboratorId),
        status: "pending",
      }) as never
    );

    await expect(
      action.execute({
        partnerships: [{ _id: partnershipId, status: "accepted" }],
        userId: initiatorId,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_ACCEPT_FORBIDDEN,
      statusCode: 403,
    });

    expect(partnershipRepository.updateOne).not.toHaveBeenCalled();
  });

  it("rejects when a third party tries to update the partnership", async () => {
    const partnershipId = mockObjectId();
    const outsiderId = mockObjectId();

    partnershipRepository.findById.mockResolvedValue(
      buildPartnership({
        _id: new Types.ObjectId(partnershipId),
        status: "pending",
      }) as never
    );

    await expect(
      action.execute({
        partnerships: [{ _id: partnershipId, status: "pending" }],
        userId: outsiderId,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_UPDATE_FORBIDDEN,
      statusCode: 403,
    });

    expect(partnershipRepository.updateOne).not.toHaveBeenCalled();
  });

  it("rejects when the partnership does not exist", async () => {
    const partnershipId = mockObjectId();

    partnershipRepository.findById.mockResolvedValue(null);

    await expect(
      action.execute({
        partnerships: [{ _id: partnershipId, status: "accepted" }],
        userId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_NOT_FOUND,
      statusCode: 404,
    });
  });
});
