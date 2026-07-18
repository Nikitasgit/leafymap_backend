import { Event } from "@src/domain/entities/Event.entity";
import {
  EventCategoryId,
  EventId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { Types } from "mongoose";

describe("Event entity", () => {
  const ownerId = UserId.from(new Types.ObjectId().toString());
  const otherUserId = UserId.from(new Types.ObjectId().toString());
  const categoryId = EventCategoryId.from(new Types.ObjectId().toString());
  const placeId = PlaceId.from(new Types.ObjectId().toString());
  const futureStart = new Date();
  futureStart.setDate(futureStart.getDate() + 10);
  const futureEnd = new Date();
  futureEnd.setDate(futureEnd.getDate() + 11);

  const baseSchedule = [
    {
      startDate: futureStart,
      endDate: futureEnd,
      timeSlots: [
        {
          title: "Morning",
          startTime: "09:00",
          endTime: "12:00",
          collaboratorIds: [],
        },
      ],
    },
  ];

  it("creates an offline event with place", () => {
    const event = Event.create({
      name: "Yoga session",
      description: "A calm yoga class",
      ownerId,
      categoryId,
      schedule: baseSchedule,
      placeId,
    });

    expect(event.id).toBeNull();
    expect(event.name).toBe("Yoga session");
    expect(event.ownerId).toBe(ownerId);
    expect(event.placeId).toBe(placeId);
    expect(event.online).toBe(false);
    expect(event.lifecycleStatus).toBe("upcoming");
    expect(event.deleted).toBe(false);
  });

  it("creates an online event without place/location", () => {
    const event = Event.create({
      name: "Online talk",
      description: "Remote event",
      ownerId,
      categoryId,
      schedule: baseSchedule,
      online: true,
    });

    expect(event.online).toBe(true);
    expect(event.placeId).toBeNull();
    expect(event.location).toBeNull();
  });

  it("rejects offline event without place or location", () => {
    expect(() =>
      Event.create({
        name: "Broken",
        description: "No place",
        ownerId,
        categoryId,
        schedule: baseSchedule,
      })
    ).toThrow();
  });

  it("belongsTo returns true for the owner", () => {
    const event = Event.reconstitute({
      id: EventId.from(new Types.ObjectId().toString()),
      name: "Yoga session",
      description: "A calm yoga class",
      ownerId,
      categoryId,
      schedule: baseSchedule,
      dateRange: { firstDate: futureStart, latestDate: futureEnd },
      status: "available",
      lifecycleStatus: "upcoming",
      placeId,
      location: null,
      online: false,
      rating: 0,
      isBookable: false,
      capacity: null,
      maxSeatsPerBooking: 1,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(event.belongsTo(ownerId)).toBe(true);
    expect(event.belongsTo(otherUserId)).toBe(false);
  });

  it("rejects maxSeatsPerBooking above capacity when bookable", () => {
    expect(() =>
      Event.create({
        name: "Bookable",
        description: "Has capacity",
        ownerId,
        categoryId,
        schedule: baseSchedule,
        placeId,
        isBookable: true,
        capacity: 2,
        maxSeatsPerBooking: 5,
      })
    ).toThrow();
  });
});
