import { EventRepository } from "@/repositories";
import Event from "../../../models/Event";
import { Types } from "mongoose";
import {
  clearCollection,
  connectMongo,
  disconnectMongo,
} from "../../helpers/mongoTestSetup";

const buildEventData = (overrides: Record<string, unknown> = {}) => ({
  name: "Test event",
  description: "Description",
  online: true,
  user: new Types.ObjectId(),
  eventCategory: new Types.ObjectId(),
  schedule: [
    {
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-01"),
    },
  ],
  deleted: false,
  ...overrides,
});

describe("EventRepository", () => {
  let repository: EventRepository;

  beforeAll(async () => {
    await connectMongo();
    repository = new EventRepository();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  beforeEach(async () => {
    await clearCollection(Event);
  });

  describe("create", () => {
    it("creates an online event", async () => {
      const eventId = await repository.create(buildEventData());

      expect(eventId).toBeInstanceOf(Types.ObjectId);

      const event = await Event.findById(eventId);
      expect(event).toBeTruthy();
      expect(event?.name).toBe("Test event");
      expect(event?.online).toBe(true);
    });
  });

  describe("findById", () => {
    it("finds an event by id", async () => {
      const created = await Event.create(buildEventData({ name: "Find me" }));
      const found = await repository.findById(created._id.toString());

      expect(found).toBeTruthy();
      expect(found?._id.toString()).toBe(created._id.toString());
      expect(found?.name).toBe("Find me");
    });

    it("returns null when the event does not exist", async () => {
      const found = await repository.findById(new Types.ObjectId().toString());
      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    beforeEach(async () => {
      await Event.create([
        buildEventData({ name: "Active event", deleted: false }),
        buildEventData({ name: "Deleted event", deleted: true }),
        buildEventData({
          name: "Upcoming event",
          deleted: false,
          schedule: [
            {
              startDate: new Date("2026-09-01"),
              endDate: new Date("2026-09-01"),
            },
          ],
        }),
        buildEventData({
          name: "Completed event",
          deleted: false,
          schedule: [
            {
              startDate: new Date("2026-01-01"),
              endDate: new Date("2026-01-01"),
            },
          ],
        }),
      ]);
    });

    it("excludes soft-deleted events when deleted filter is false", async () => {
      const events = await repository.findAll({
        filters: { deleted: false },
        project: ["name", "deleted"],
      });

      expect(events.length).toBe(3);
      expect(events.every((event) => event.deleted === false)).toBe(true);
      expect(events.map((event) => event.name)).not.toContain("Deleted event");
    });

    it("filters by lifecycleStatus upcoming", async () => {
      const events = await repository.findAll({
        filters: { deleted: false, lifecycleStatus: "upcoming" },
        project: ["name", "lifecycleStatus"],
      });

      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events.every((event) => event.lifecycleStatus === "upcoming")).toBe(
        true
      );
      expect(events.map((event) => event.name)).toContain("Upcoming event");
    });
  });

  describe("updateOne", () => {
    it("updates an event field", async () => {
      const created = await Event.create(buildEventData({ name: "Old name" }));

      await repository.updateOne(created._id.toString(), { name: "New name" });

      const updated = await Event.findById(created._id);
      expect(updated?.name).toBe("New name");
    });
  });
});
