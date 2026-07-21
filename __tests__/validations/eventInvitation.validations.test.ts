import {
  createEventInvitationsSchema,
  updateEventInvitationsSchema,
} from "@src/api/dto/eventInvitations/eventInvitation.dto";
import { Types } from "mongoose";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("eventInvitation validations", () => {
  describe("createEventInvitationsSchema", () => {
    it("accepts a valid invitations payload", () => {
      const result = createEventInvitationsSchema.safeParse({
        eventInvitations: [{ collaborator: { id: mockObjectId() } }],
      });

      expect(result.success).toBe(true);
    });

    it("rejects an empty invitations array", () => {
      const result = createEventInvitationsSchema.safeParse({
        eventInvitations: [],
      });

      expect(result.success).toBe(false);
    });

    it("rejects an invalid collaborator id", () => {
      const result = createEventInvitationsSchema.safeParse({
        eventInvitations: [{ collaborator: { id: "not-an-id" } }],
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateEventInvitationsSchema", () => {
    it("accepts a status update payload", () => {
      const result = updateEventInvitationsSchema.safeParse({
        eventInvitations: [{ id: mockObjectId(), status: "accepted" }],
      });

      expect(result.success).toBe(true);
    });

    it("rejects an invalid status", () => {
      const result = updateEventInvitationsSchema.safeParse({
        eventInvitations: [{ id: mockObjectId(), status: "unknown" }],
      });

      expect(result.success).toBe(false);
    });
  });
});
