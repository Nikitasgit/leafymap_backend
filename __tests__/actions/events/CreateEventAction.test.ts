import { CreateEventAction } from "@/actions/events";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { newEventSchema } from "@/validations/event.validations";
import { Types } from "mongoose";

const baseEventData = {
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
};

const baseActionEventData = {
  ...baseEventData,
  schedule: [
    {
      startDate: new Date("2026-07-01T10:00:00.000Z"),
      endDate: new Date("2026-07-01T18:00:00.000Z"),
      timeSlots: [],
    },
  ],
};

const location = {
  type: "Point" as const,
  coordinates: [2.3522, 48.8566] as [number, number],
  label: "Paris",
  id: "mapbox-place-id",
};

describe("CreateEventAction", () => {
  let eventRepository: jest.Mocked<IEventRepository>;
  let placeRepository: jest.Mocked<IPlaceRepository>;
  let action: CreateEventAction;

  beforeEach(() => {
    eventRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
    };

    placeRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      aggregate: jest.fn(),
    };

    action = new CreateEventAction(eventRepository, placeRepository);
  });

  it("validates an online event without place or location", () => {
    const result = newEventSchema.safeParse({
      ...baseEventData,
      online: true,
    });

    expect(result.success).toBe(true);
  });

  it("validates an event with a custom location and no place", () => {
    const result = newEventSchema.safeParse({
      ...baseEventData,
      location,
      online: false,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an in-person event without place or location", () => {
    const result = newEventSchema.safeParse({
      ...baseEventData,
      online: false,
    });

    expect(result.success).toBe(false);
  });

  it("creates an event with an owned place", async () => {
    const userId = new Types.ObjectId().toString();
    const placeId = new Types.ObjectId().toString();
    const eventId = new Types.ObjectId();

    placeRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(placeId),
      user: new Types.ObjectId(userId),
    } as any);
    eventRepository.create.mockResolvedValue(eventId);

    const result = await action.execute({
      eventData: {
        ...baseEventData,
        ...baseActionEventData,
        user: userId,
        place: placeId,
        online: false,
      },
    });

    expect(result).toEqual({ _id: eventId.toString() });
    expect(placeRepository.findById).toHaveBeenCalledWith(placeId, ["user"]);
    expect(eventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: userId,
        place: placeId,
        location: null,
        online: false,
        deleted: false,
      })
    );
  });

  it("rejects an event with a place owned by another user", async () => {
    const userId = new Types.ObjectId().toString();
    const placeId = new Types.ObjectId().toString();

    placeRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(placeId),
      user: new Types.ObjectId(),
    } as any);

    await expect(
      action.execute({
        eventData: {
          ...baseEventData,
          ...baseActionEventData,
          user: userId,
          place: placeId,
          online: false,
        },
      })
    ).rejects.toThrow("You don't have permission to use this place");

    expect(eventRepository.create).not.toHaveBeenCalled();
  });
});
