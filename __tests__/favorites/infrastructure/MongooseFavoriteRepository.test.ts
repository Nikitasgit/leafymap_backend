import mongoose from "mongoose";
import {
  clearCollection,
  connectMongo,
  disconnectMongo,
} from "../../helpers/mongoTestSetup";
import MongooseFavoriteRepository from "@src/infrastructure/repositories/MongooseFavoriteRepository";
import { Favorite } from "@src/domain/entities/Favorite.entity";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import FavoriteModel from "@src/infrastructure/persistence/schemas/Favorite.schema";

describe("MongooseFavoriteRepository", () => {
  const repository = new MongooseFavoriteRepository();

  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  beforeEach(async () => {
    await clearCollection(FavoriteModel);
  });

  it("saves and finds a favorite by user and reference", async () => {
    const userId = UserId.from(new mongoose.Types.ObjectId().toString());
    const referenceId = ReferenceId.from(
      new mongoose.Types.ObjectId().toString()
    );

    const id = await repository.save(
      Favorite.create({
        userId,
        referenceId,
        referenceType: "Place",
      })
    );

    const found = await repository.findByUserAndReference(
      userId,
      referenceId,
      "Place"
    );

    expect(found?.id).toBe(id);
    expect(found?.userId).toBe(userId);
    expect(found?.referenceId).toBe(referenceId);
  });

  it("enforces unique user + reference + referenceType", async () => {
    const userId = UserId.from(new mongoose.Types.ObjectId().toString());
    const referenceId = ReferenceId.from(
      new mongoose.Types.ObjectId().toString()
    );

    const favorite = Favorite.create({
      userId,
      referenceId,
      referenceType: "Place",
    });

    await repository.save(favorite);

    await expect(repository.save(favorite)).rejects.toThrow();
  });
});
