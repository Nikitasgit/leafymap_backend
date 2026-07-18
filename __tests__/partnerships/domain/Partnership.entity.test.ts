import { Types } from "mongoose";
import { Partnership } from "@src/domain/entities/Partnership.entity";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("Partnership entity", () => {
  const initiatorId = UserId.from(mockObjectId());
  const collaboratorId = UserId.from(mockObjectId());

  it("creates a pending partnership", () => {
    const partnership = Partnership.create({
      initiatorId,
      collaboratorId,
    });

    expect(partnership.id).toBeNull();
    expect(partnership.status).toBe("pending");
    expect(partnership.deleted).toBe(false);
    expect(partnership.isInitiator(initiatorId)).toBe(true);
    expect(partnership.isCollaborator(collaboratorId)).toBe(true);
  });

  it("rejects partnering with yourself", () => {
    expect(() =>
      Partnership.create({
        initiatorId,
        collaboratorId: initiatorId,
      })
    ).toThrow();
  });

  it("accepts a pending partnership", () => {
    const partnership = Partnership.create({
      initiatorId,
      collaboratorId,
    });

    const accepted = partnership.accept();
    expect(accepted.status).toBe("accepted");
  });

  it("refuses a pending partnership", () => {
    const partnership = Partnership.create({
      initiatorId,
      collaboratorId,
    });

    const refused = partnership.refuse();
    expect(refused.status).toBe("refused");
  });

  it("cancels a partnership", () => {
    const partnership = Partnership.reconstitute({
      id: PartnershipId.from(mockObjectId()),
      initiatorId,
      collaboratorId,
      status: "accepted",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const cancelled = partnership.cancel();
    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.deleted).toBe(true);
  });

  it("does not accept a non-pending partnership", () => {
    const partnership = Partnership.reconstitute({
      id: PartnershipId.from(mockObjectId()),
      initiatorId,
      collaboratorId,
      status: "accepted",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(() => partnership.accept()).toThrow();
  });
});
