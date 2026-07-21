import {
  clearCollection,
  connectMongo,
  disconnectMongo,
} from "../../helpers/mongoTestSetup";
import MongooseEventRepository from "@src/infrastructure/repositories/MongooseEventRepository";
import EventCategoryModel from "@src/infrastructure/persistence/schemas/EventCategory.schema";
import EventModel from "@src/infrastructure/persistence/schemas/Event.schema";
import ImageModel from "@src/infrastructure/persistence/schemas/Image.schema";
import PlaceCategoryModel from "@src/infrastructure/persistence/schemas/PlaceCategory.schema";
import PlaceModel from "@src/infrastructure/persistence/schemas/Place.schema";
import UserModel from "@src/infrastructure/persistence/schemas/User.schema";
import { EventId, PlaceId } from "@src/domain/value-objects/ObjectId.vo";

const defaultSchedule = {
  monday: { open: false, timeSlots: [] },
  tuesday: { open: false, timeSlots: [] },
  wednesday: { open: false, timeSlots: [] },
  thursday: { open: false, timeSlots: [] },
  friday: { open: false, timeSlots: [] },
  saturday: { open: false, timeSlots: [] },
  sunday: { open: false, timeSlots: [] },
};

describe("MongooseEventRepository", () => {
  const repository = new MongooseEventRepository();

  beforeAll(connectMongo);
  afterAll(disconnectMongo);

  beforeEach(async () => {
    await Promise.all([
      clearCollection(EventModel),
      clearCollection(EventCategoryModel),
      clearCollection(ImageModel),
      clearCollection(PlaceModel),
      clearCollection(PlaceCategoryModel),
      clearCollection(UserModel),
    ]);
  });

  const createFixture = async () => {
    const user = await UserModel.create({
      email: "owner@example.com",
      username: "event-owner",
      password: "hash",
      userType: "creator",
      role: "user",
      deleted: false,
      acceptedCGU: true,
      acceptedAt: new Date(),
    });
    const collaborator = await UserModel.create({
      email: "collaborator@example.com",
      username: "collaborator",
      password: "hash",
      userType: "guest",
      role: "user",
      deleted: false,
      acceptedCGU: true,
      acceptedAt: new Date(),
    });
    const eventCategory = await EventCategoryModel.create({ name: "Market" });
    const placeCategory = await PlaceCategoryModel.create({
      name: "Hall",
      types: [],
    });
    const place = await PlaceModel.create({
      user: user._id,
      placeCategory: placeCategory._id,
      location: {
        type: "Point",
        coordinates: [2.35, 48.85],
        label: "Paris",
        id: "paris",
      },
      defaultSchedule,
      customDates: [],
    });
    const startDate = new Date("2027-03-10T10:00:00Z");
    const endDate = new Date("2027-03-10T18:00:00Z");
    const event = await EventModel.create({
      name: "Market [A]",
      description: "Local market",
      eventCategory: eventCategory._id,
      user: user._id,
      place: place._id,
      online: false,
      schedule: [
        {
          startDate,
          endDate,
          timeSlots: [
            {
              title: "Morning",
              startTime: "10:00",
              endTime: "12:00",
              collaborators: [collaborator._id],
            },
          ],
        },
      ],
    });
    const image = await ImageModel.create({
      urls: {
        original: "original.jpg",
        thumbnail: "thumbnail.jpg",
        medium: "medium.jpg",
      },
      user: user._id,
      reference: event._id,
      referenceType: "Event",
      type: "cover",
      originalName: "market.jpg",
      size: 100,
      mimetype: "image/jpeg",
    });
    await EventModel.updateOne({ _id: event._id }, { image: image._id });
    return { event, place, startDate, endDate };
  };

  it("projects and populates event details", async () => {
    const { event, place } = await createFixture();

    const detail = await repository.findDetailsById(
      EventId.from(event._id.toString())
    );

    expect(detail).toMatchObject({
      id: event._id.toString(),
      eventCategory: { name: "Market" },
      place: { id: place._id.toString() },
      user: { username: "event-owner" },
      image: { urls: { thumbnail: "thumbnail.jpg" } },
      schedule: [
        {
          timeSlots: [
            {
              collaborators: [
                { name: "collaborator" },
              ],
            },
          ],
        },
      ],
    });
    expect(detail).not.toHaveProperty("_id");
  });

  it("escapes search input and excludes cancelled matches", async () => {
    const { event } = await createFixture();
    await EventModel.create({
      name: "Market A",
      description: "Should not match a literal bracket query",
      eventCategory: event.eventCategory,
      user: event.user,
      place: event.place,
      online: false,
      status: "cancelled",
      schedule: event.schedule,
    });

    const result = await repository.findList({ search: "[A]" });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: event._id.toString(),
      name: "Market [A]",
    });
  });

  it("finds only overlapping, non-deleted place events", async () => {
    const { event, place, startDate, endDate } = await createFixture();
    await EventModel.updateOne(
      { _id: event._id },
      { deleted: false, status: "available" }
    );

    const result = await repository.findByPlaceInDateRange(
      PlaceId.from(place._id.toString()),
      new Date(startDate.getTime() - 60_000),
      new Date(endDate.getTime() + 60_000)
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: event._id.toString(),
      image: { urls: { thumbnail: "thumbnail.jpg" } },
    });
  });
});
