import { Follow } from "@src/domain/entities/Follow.entity";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { Types } from "mongoose";

describe("Follow entity", () => {
  const followerId = UserId.from(new Types.ObjectId().toString());
  const followingId = UserId.from(new Types.ObjectId().toString());

  it("creates a follow without an id", () => {
    const follow = Follow.create({ followerId, followingId });

    expect(follow.id).toBeNull();
    expect(follow.followerId).toBe(followerId);
    expect(follow.followingId).toBe(followingId);
  });

  it("rejects self-follow on create", () => {
    expect(() =>
      Follow.create({ followerId, followingId: followerId })
    ).toThrow("Cannot follow yourself");
  });

  it("belongsTo returns true for the follower", () => {
    const follow = Follow.reconstitute({
      id: FollowId.from(new Types.ObjectId().toString()),
      followerId,
      followingId,
      createdAt: new Date(),
    });

    expect(follow.belongsTo(followerId)).toBe(true);
    expect(follow.belongsTo(followingId)).toBe(false);
  });

  it("isSelfFollow detects identical ids", () => {
    expect(Follow.isSelfFollow(followerId, followerId)).toBe(true);
    expect(Follow.isSelfFollow(followerId, followingId)).toBe(false);
  });
});
