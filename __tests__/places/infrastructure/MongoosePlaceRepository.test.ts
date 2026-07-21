import {
  clearCollection,
  connectMongo,
  disconnectMongo,
} from "../../helpers/mongoTestSetup";
import MongoosePlaceRepository from "@src/infrastructure/repositories/MongoosePlaceRepository";
import PlaceCategoryModel from "@src/infrastructure/persistence/schemas/PlaceCategory.schema";
import PlaceModel from "@src/infrastructure/persistence/schemas/Place.schema";
import UserModel from "@src/infrastructure/persistence/schemas/User.schema";
import { PlaceId } from "@src/domain/value-objects/ObjectId.vo";

const defaultSchedule = {
  monday: { open: true, timeSlots: [{ startTime: "09:00", endTime: "18:00" }] },
  tuesday: { open: false, timeSlots: [] },
  wednesday: { open: false, timeSlots: [] },
  thursday: { open: false, timeSlots: [] },
  friday: { open: false, timeSlots: [] },
  saturday: { open: false, timeSlots: [] },
  sunday: { open: false, timeSlots: [] },
};

describe("MongoosePlaceRepository", () => {
  const repository = new MongoosePlaceRepository();

  beforeAll(connectMongo);
  afterAll(disconnectMongo);

  beforeEach(async () => {
    await Promise.all([
      clearCollection(PlaceModel),
      clearCollection(PlaceCategoryModel),
      clearCollection(UserModel),
    ]);
  });

  const createFixture = async () => {
    const user = await UserModel.create({
      email: "place-owner@example.com",
      username: "place-owner",
      description: "Independent venue",
      password: "hash",
      userType: "creator",
      role: "user",
      deleted: false,
      acceptedCGU: true,
      acceptedAt: new Date(),
    });
    const category = await PlaceCategoryModel.create({
      name: "Workshop",
      types: [],
    });
    const place = await PlaceModel.create({
      user: user._id,
      placeCategory: category._id,
      location: {
        type: "Point",
        coordinates: [2.35, 48.85],
        label: "Paris",
        id: "paris",
      },
      defaultSchedule,
      customDates: [],
      rating: 4.5,
    });
    return { user, category, place };
  };

  it("projects and populates place details", async () => {
    const { user, category, place } = await createFixture();

    const detail = await repository.findDetailsById(
      PlaceId.from(place._id.toString())
    );

    expect(detail).toMatchObject({
      id: place._id.toString(),
      rating: 4.5,
      placeCategory: { id: category._id.toString(), name: "Workshop" },
      user: {
        id: user._id.toString(),
        username: "place-owner",
        description: "Independent venue",
      },
      defaultSchedule: {
        monday: {
          open: true,
          timeSlots: [{ startTime: "09:00", endTime: "18:00" }],
        },
      },
    });
    expect(detail).not.toHaveProperty("_id");
  });

  it("filters lists by category and excludes deleted places", async () => {
    const { category, place } = await createFixture();
    await PlaceModel.create({
      user: place.user,
      placeCategory: category._id,
      location: {
        type: "Point",
        coordinates: [2.36, 48.86],
        label: "Deleted",
        id: "deleted",
      },
      defaultSchedule,
      customDates: [],
      deleted: true,
    });

    const result = await repository.findList({
      placeCategoryId: category._id.toString(),
      limit: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: place._id.toString(),
      placeCategory: { name: "Workshop" },
    });
  });

  it("runs the stable ids branch of the in-view aggregation", async () => {
    const { place } = await createFixture();

    const result = await repository.findInView({
      ids: [place._id.toString()],
      limit: 5,
      clientFilters: {
        placeTypes: [],
        placeCategories: [],
        userCategoryIds: [],
        productCategoryIds: [],
        minRating: 4,
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: place._id.toString(),
      user: { username: "place-owner" },
      placeCategory: { name: "Workshop" },
    });
  });
});
