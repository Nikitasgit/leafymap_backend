import { Types } from "mongoose";
import CreatePartnershipsAction from "@/actions/partnerships/CreatePartnerships.action";
import NotificationService from "@/services/notificationService";
import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import {
  buildPartnership,
  createMockRepository,
  mockObjectId,
} from "../../helpers/mockRepositories";

const mockCreateNotification = jest.fn().mockResolvedValue(undefined);

jest.mock("@/services/notificationService", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    createNotification: mockCreateNotification,
  })),
}));

describe("CreatePartnershipsAction", () => {
  let partnershipRepository: jest.Mocked<IPartnershipRepository>;
  let notificationService: NotificationService;
  let action: CreatePartnershipsAction;

  beforeEach(() => {
    mockCreateNotification.mockClear();
    partnershipRepository = createMockRepository<IPartnershipRepository>();
    notificationService = {
      createNotification: mockCreateNotification,
    } as unknown as NotificationService;
    action = new CreatePartnershipsAction(
      partnershipRepository,
      notificationService
    );
  });

  it("creates a partnership and sends a notification", async () => {
    const partnershipId = new Types.ObjectId();
    const initiatorId = mockObjectId();
    const collaboratorId = mockObjectId();
    const createdPartnership = buildPartnership({
      _id: partnershipId,
      initiator: new Types.ObjectId(initiatorId),
      collaborator: new Types.ObjectId(collaboratorId),
      status: "pending",
    });

    partnershipRepository.findOne.mockResolvedValue(null);
    partnershipRepository.create.mockResolvedValue(partnershipId);
    partnershipRepository.findById.mockResolvedValue(createdPartnership as never);

    const result = await action.execute({
      partnership: { collaborator: { _id: collaboratorId } },
      initiatorId,
    });

    expect(result).toEqual(createdPartnership);
    expect(partnershipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "pending",
        deleted: false,
      })
    );
    expect(mockCreateNotification).toHaveBeenCalledWith({
      sender: initiatorId,
      receiver: collaboratorId,
      action: "partnership_invitation",
      reference: partnershipId.toString(),
      referenceType: "Partnership",
    });
  });

  it("rejects when an accepted partnership already exists", async () => {
    const initiatorId = mockObjectId();
    const collaboratorId = mockObjectId();

    partnershipRepository.findOne.mockResolvedValue(
      buildPartnership({ status: "accepted" }) as never
    );

    await expect(
      action.execute({
        partnership: { collaborator: { _id: collaboratorId } },
        initiatorId,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_ALREADY_EXISTS,
      statusCode: 409,
    });

    expect(partnershipRepository.create).not.toHaveBeenCalled();
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it("rejects when a pending invitation was already sent", async () => {
    const initiatorId = mockObjectId();
    const collaboratorId = mockObjectId();

    partnershipRepository.findOne.mockResolvedValue(
      buildPartnership({ status: "pending" }) as never
    );

    await expect(
      action.execute({
        partnership: { collaborator: { _id: collaboratorId } },
        initiatorId,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PARTNERSHIP_INVITATION_ALREADY_SENT,
      statusCode: 409,
    });

    expect(partnershipRepository.create).not.toHaveBeenCalled();
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });
});
