import mongoose from "mongoose";
import {
  clearCollection,
  connectMongo,
  disconnectMongo,
} from "../../helpers/mongoTestSetup";
import MongooseFollowRepository from "@src/infrastructure/repositories/MongooseFollowRepository";
import { Follow } from "@src/domain/entities/Follow.entity";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import FollowModel from "@src/infrastructure/persistence/schemas/Follow.schema";

describe("MongooseFollowRepository", () => {
  const repository = new MongooseFollowRepository();

  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  beforeEach(async () => {
    await clearCollection(FollowModel);
  });

  it("saves and finds a follow by pair", async () => {
    const followerId = UserId.from(new mongoose.Types.ObjectId().toString());
    const followingId = UserId.from(new mongoose.Types.ObjectId().toString());

    const id = await repository.save(
      Follow.create({
        followerId,
        followingId,
      })
    );

    const found = await repository.findByPair(followerId, followingId);

    expect(found?.id).toBe(id);
    expect(found?.followerId).toBe(followerId);
    expect(found?.followingId).toBe(followingId);
  });

  it("enforces unique follower + following", async () => {
    const followerId = UserId.from(new mongoose.Types.ObjectId().toString());
    const followingId = UserId.from(new mongoose.Types.ObjectId().toString());

    const follow = Follow.create({
      followerId,
      followingId,
    });

    await repository.save(follow);

    await expect(repository.save(follow)).rejects.toThrow();
  });

  it("deletes a follow", async () => {
    const followerId = UserId.from(new mongoose.Types.ObjectId().toString());
    const followingId = UserId.from(new mongoose.Types.ObjectId().toString());

    const id = await repository.save(
      Follow.create({
        followerId,
        followingId,
      })
    );

    await repository.delete(id);

    const found = await repository.findById(id);
    expect(found).toBeNull();
  });
});
