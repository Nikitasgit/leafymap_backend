import { Types } from "mongoose";
import { EventInvitation } from "@src/domain/entities/EventInvitation.entity";
import {
  EventId,
  EventInvitationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("EventInvitation entity", () => {
  const eventId = EventId.from(mockObjectId());
  const initiatorId = UserId.from(mockObjectId());
  const collaboratorId = UserId.from(mockObjectId());

  it("creates a pending invitation", () => {
    const invitation = EventInvitation.create({
      eventId,
      initiatorId,
      collaboratorId,
    });

    expect(invitation.id).toBeNull();
    expect(invitation.status).toBe("pending");
    expect(invitation.deleted).toBe(false);
    expect(invitation.isInitiator(initiatorId)).toBe(true);
    expect(invitation.isCollaborator(collaboratorId)).toBe(true);
  });

  it("rejects inviting yourself", () => {
    expect(() =>
      EventInvitation.create({
        eventId,
        initiatorId,
        collaboratorId: initiatorId,
      })
    ).toThrow();
  });

  it("accepts a pending invitation", () => {
    const invitation = EventInvitation.create({
      eventId,
      initiatorId,
      collaboratorId,
    });

    const accepted = invitation.accept();
    expect(accepted.status).toBe("accepted");
  });

  it("refuses a pending invitation", () => {
    const invitation = EventInvitation.create({
      eventId,
      initiatorId,
      collaboratorId,
    });

    const refused = invitation.refuse();
    expect(refused.status).toBe("refused");
  });

  it("cancels an invitation", () => {
    const invitation = EventInvitation.reconstitute({
      id: EventInvitationId.from(mockObjectId()),
      eventId,
      initiatorId,
      collaboratorId,
      status: "accepted",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const cancelled = invitation.cancel();
    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.deleted).toBe(true);
  });

  it("does not accept a non-pending invitation", () => {
    const invitation = EventInvitation.reconstitute({
      id: EventInvitationId.from(mockObjectId()),
      eventId,
      initiatorId,
      collaboratorId,
      status: "accepted",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(() => invitation.accept()).toThrow();
  });
});
