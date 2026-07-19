import {
  getEventsQuerySchema,
  newEventSchema,
} from "@src/api/dto/events/event.dto";
import { Types } from "mongoose";

const location = {
  type: "Point" as const,
  coordinates: [2.3522, 48.8566] as [number, number],
  label: "Paris",
  id: "mapbox-place-id",
};

const buildEventValidationPayload = (
  overrides: Record<string, unknown> = {}
) => ({
  name: "Marché local",
  description: "Un événement de quartier pour découvrir les créateurs locaux.",
  eventCategory: new Types.ObjectId().toString(),
  schedule: [
    {
      startDate: "2026-07-01T10:00:00.000Z",
      endDate: "2026-07-01T18:00:00.000Z",
      timeSlots: [],
    },
  ],
  online: false,
  ...overrides,
});

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
