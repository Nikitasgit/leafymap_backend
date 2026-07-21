import { Types } from "mongoose";
import {
  clearCollection,
  connectMongo,
  disconnectMongo,
} from "../../helpers/mongoTestSetup";
import MongooseUserRepository from "@src/infrastructure/repositories/MongooseUserRepository";
import PlaceCategoryModel from "@src/infrastructure/persistence/schemas/PlaceCategory.schema";
import PlaceModel from "@src/infrastructure/persistence/schemas/Place.schema";
import UserModel from "@src/infrastructure/persistence/schemas/User.schema";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

const defaultSchedule = {
  monday: { open: false, timeSlots: [] },
  tuesday: { open: false, timeSlots: [] },
  wednesday: { open: false, timeSlots: [] },
  thursday: { open: false, timeSlots: [] },
  friday: { open: false, timeSlots: [] },
  saturday: { open: false, timeSlots: [] },
  sunday: { open: false, timeSlots: [] },
};

const createUser = async (
  email: string,
  overrides: Record<string, unknown> = {}
) =>
  UserModel.create({
    email,
    username: email.split("@")[0],
    password: "hash",
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    acceptedCGU: true,
    acceptedAt: new Date(),
    ...overrides,
  });

describe("MongooseUserRepository", () => {
  const repository = new MongooseUserRepository();

  beforeAll(connectMongo);
  afterAll(disconnectMongo);

  beforeEach(async () => {
    await Promise.all([
      clearCollection(UserModel),
      clearCollection(PlaceModel),
      clearCollection(PlaceCategoryModel),
    ]);
  });

  it("applies detail projection, populate and deleted filtering", async () => {
    const category = await PlaceCategoryModel.create({
      name: "Markets",
      types: [],
    });
    const user = await createUser("owner@example.com", {
      description: "Local producer",
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
    });
    await UserModel.updateOne({ _id: user._id }, { place: place._id });

    const detail = await repository.findDetailsById(
      UserId.from(user._id.toString())
    );

    expect(detail).toMatchObject({
      id: user._id.toString(),
      email: "owner@example.com",
      place: {
        id: place._id.toString(),
        placeCategory: { id: category._id.toString(), name: "Markets" },
      },
    });
    expect(detail).not.toHaveProperty("password");

    await UserModel.updateOne({ _id: user._id }, { deleted: true });
    await expect(
      repository.findDetailsById(UserId.from(user._id.toString()))
    ).resolves.toBeNull();
    await expect(
      repository.findDetailsById(UserId.from(user._id.toString()), {
        view: "admin",
        includeDeleted: true,
      })
    ).resolves.toMatchObject({ id: user._id.toString(), deleted: true });
  });

  it("filters user lists case-insensitively and excludes ids", async () => {
    const alice = await createUser("alice@example.com", {
      username: "AliceMaker",
    });
    await createUser("bob@example.com", { username: "BobMaker" });

    const result = await repository.findList({
      username: "maker",
      excludeIds: [alice._id.toString()],
      limit: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ username: "BobMaker" });
    expect(Types.ObjectId.isValid(result[0].id)).toBe(true);
  });
});
