import { Follow } from "@src/domain/entities/Follow.entity";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface FollowUserProfile {
  _id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  image?: {
    urls: {
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      original?: string;
    };
  };
  userType: "creator" | "guest";
}

export interface FollowingUserProfile extends FollowUserProfile {
  followId: string;
}

export interface IFollowRepository {
  save(follow: Follow): Promise<FollowId>;
  findById(id: FollowId): Promise<Follow | null>;
  findByPair(
    followerId: UserId,
    followingId: UserId
  ): Promise<Follow | null>;
  findFollowersOf(userId: UserId): Promise<FollowUserProfile[]>;
  findFollowingOf(userId: UserId): Promise<FollowingUserProfile[]>;
  delete(id: FollowId): Promise<void>;
  deleteAllInvolvingUser(userId: UserId): Promise<void>;
}
