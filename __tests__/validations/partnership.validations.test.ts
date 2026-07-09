import { getPartnershipsByUserIdQuerySchema } from "@/validations/partnership.validations";

describe("partnership validations", () => {
  describe("getPartnershipsByUserIdQuerySchema", () => {
    it("transforms string booleans into actual booleans", () => {
      const result = getPartnershipsByUserIdQuerySchema.safeParse({
        asCollaborator: "true",
        asInitiator: "false",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.asCollaborator).toBe(true);
        expect(result.data.asInitiator).toBe(false);
      }
    });

    it("accepts a valid partnership status", () => {
      const result = getPartnershipsByUserIdQuerySchema.safeParse({
        status: "accepted",
      });

      expect(result.success).toBe(true);
    });

    it("rejects an invalid partnership status", () => {
      const result = getPartnershipsByUserIdQuerySchema.safeParse({
        status: "invalid",
      });

      expect(result.success).toBe(false);
    });
  });
});
