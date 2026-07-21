import { ImageReferenceReadModel } from "@src/domain/read-models/shared.read-models";

export interface FollowUserProfileReadModel {
  id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  image?: ImageReferenceReadModel | string | null;
  userType: "creator" | "guest";
}

export interface FollowingUserProfileReadModel extends FollowUserProfileReadModel {
  followId: string;
}
