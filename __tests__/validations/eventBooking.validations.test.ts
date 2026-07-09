import { createEventBookingSchema } from "@/validations/eventBooking.validations";

describe("eventBooking validations", () => {
  describe("createEventBookingSchema", () => {
    it("accepts a valid seat count", () => {
      const result = createEventBookingSchema.safeParse({ seats: 2 });

      expect(result.success).toBe(true);
    });

    it("rejects zero seats", () => {
      const result = createEventBookingSchema.safeParse({ seats: 0 });

      expect(result.success).toBe(false);
    });

    it("rejects a non-integer seat count", () => {
      const result = createEventBookingSchema.safeParse({ seats: 1.5 });

      expect(result.success).toBe(false);
    });

    it("rejects a missing seat count", () => {
      const result = createEventBookingSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });
});
