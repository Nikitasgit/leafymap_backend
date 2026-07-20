import { Follow } from "@src/domain/entities/Follow.entity";
import {
  FollowingUserProfileReadModel,
  FollowUserProfileReadModel,
} from "@src/domain/read-models/follow.read-models";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IFollowRepository {
  save(follow: Follow): Promise<FollowId>;
  findById(id: FollowId): Promise<Follow | null>;
  findByPair(
    followerId: UserId,
    followingId: UserId
  ): Promise<Follow | null>;
  findFollowersOf(userId: UserId): Promise<FollowUserProfileReadModel[]>;
  findFollowingOf(userId: UserId): Promise<FollowingUserProfileReadModel[]>;
  delete(id: FollowId): Promise<void>;
  deleteAllInvolvingUser(userId: UserId): Promise<void>;
}
