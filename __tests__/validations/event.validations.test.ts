import {
  getEventsQuerySchema,
  newEventSchema,
} from "@/validations/event.validations";
import { buildEventValidationPayload } from "../helpers/mockRepositories";

const location = {
  type: "Point" as const,
  coordinates: [2.3522, 48.8566] as [number, number],
  label: "Paris",
  id: "mapbox-place-id",
};

describe("event validations", () => {
  describe("newEventSchema", () => {
    it("accepts an online event without place or location", () => {
      const result = newEventSchema.safeParse(
        buildEventValidationPayload({ online: true })
      );

      expect(result.success).toBe(true);
    });

    it("accepts an event with a custom location and no place", () => {
      const result = newEventSchema.safeParse(
        buildEventValidationPayload({ location, online: false })
      );

      expect(result.success).toBe(true);
    });

    it("rejects an in-person event without place or location", () => {
      const result = newEventSchema.safeParse(
        buildEventValidationPayload({ online: false })
      );

      expect(result.success).toBe(false);
    });
  });

  describe("getEventsQuerySchema", () => {
    it("parses comma-separated lifecycle statuses", () => {
      const result = getEventsQuerySchema.safeParse({
        lifecycleStatus: "upcoming, ongoing",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lifecycleStatus).toEqual(["upcoming", "ongoing"]);
      }
    });

    it("rejects a mix of valid and invalid lifecycle statuses", () => {
      const result = getEventsQuerySchema.safeParse({
        lifecycleStatus: "upcoming,unknown",
      });

      expect(result.success).toBe(false);
    });

    it("rejects an invalid lifecycle status", () => {
      const result = getEventsQuerySchema.safeParse({
        lifecycleStatus: "unknown",
      });

      expect(result.success).toBe(false);
    });
  });
});
