/**
 * Typed read models for Follow query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface FollowUserProfileReadModel {
  id: string;
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

export interface FollowingUserProfileReadModel extends FollowUserProfileReadModel {
  followId: string;
}
