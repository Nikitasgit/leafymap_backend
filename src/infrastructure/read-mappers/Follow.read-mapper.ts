import {
  FollowingUserProfileReadModel,
  FollowUserProfileReadModel,
} from "@src/domain/read-models/follow.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

interface NormalizedFollowerDoc {
  id: string;
  follower: FollowUserProfileReadModel;
}

interface NormalizedFollowingDoc {
  id: string;
  following: FollowUserProfileReadModel;
}

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we lift the populated `follower`/`following` sub-document into the flat
 * profile shape expected by the API.
 */
export class FollowReadMapper {
  static toFollowerProfile(doc: unknown): FollowUserProfileReadModel {
    const normalized = normalizeLeanDocument<NormalizedFollowerDoc>(doc);
    const follower = normalized.follower;

    return {
      id: follower.id,
      username: follower.username,
      firstname: follower.firstname,
      lastname: follower.lastname,
      image: follower.image,
      userType: follower.userType,
    };
  }

  static toFollowerProfiles(docs: unknown[]): FollowUserProfileReadModel[] {
    return docs.map((doc) => FollowReadMapper.toFollowerProfile(doc));
  }

  static toFollowingProfile(doc: unknown): FollowingUserProfileReadModel {
    const normalized = normalizeLeanDocument<NormalizedFollowingDoc>(doc);
    const following = normalized.following;

    return {
      id: following.id,
      followId: normalized.id,
      username: following.username,
      firstname: following.firstname,
      lastname: following.lastname,
      image: following.image,
      userType: following.userType,
    };
  }

  static toFollowingProfiles(
    docs: unknown[]
  ): FollowingUserProfileReadModel[] {
    return docs.map((doc) => FollowReadMapper.toFollowingProfile(doc));
  }
}
