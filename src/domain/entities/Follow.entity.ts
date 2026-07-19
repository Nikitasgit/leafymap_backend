import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export interface CreateFollowParams {
  followerId: UserId;
  followingId: UserId;
}

export interface ReconstituteFollowParams extends CreateFollowParams {
  id: FollowId;
  createdAt: Date;
}

export class Follow {
  private constructor(
    public readonly id: FollowId | null,
    public readonly followerId: UserId,
    public readonly followingId: UserId,
    public readonly createdAt: Date
  ) {}

  static create(params: CreateFollowParams): Follow {
    if (Follow.isSelfFollow(params.followerId, params.followingId)) {
      throw new ValidationError(
        { followingId: "Cannot follow yourself" },
        ERROR_CODES.FOLLOW_SELF_NOT_ALLOWED,
        "Cannot follow yourself"
      );
    }

    return new Follow(
      null,
      params.followerId,
      params.followingId,
      new Date()
    );
  }

  static reconstitute(params: ReconstituteFollowParams): Follow {
    return new Follow(
      params.id,
      params.followerId,
      params.followingId,
      params.createdAt
    );
  }

  static isSelfFollow(followerId: UserId, followingId: UserId): boolean {
    return followerId === followingId;
  }

  belongsTo(followerId: UserId): boolean {
    return this.followerId === followerId;
  }
}
