import { IFollowRepository } from "@/types/repositories/follow.repository.types";
import { Types } from "mongoose";

export interface FollowUser {
  _id: string;
  followId: string;
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

export interface IFindFollowingAction {
  execute(params: {
    userId: string;
  }): Promise<FollowUser[]>;
}

class FindFollowingAction implements IFindFollowingAction {
  constructor(private followRepository: IFollowRepository) {}

  async execute({ userId }: { userId: string }): Promise<FollowUser[]> {
    const follows = await this.followRepository.findAll({
      filters: {
        follower: userId,
      },
      project: [
        "_id",
        "following._id",
        "following.username",
        "following.firstname",
        "following.lastname",
        "following.image.urls",
        "following.userType",
      ],
    });

    return follows.map((follow: any) => {
      const following = follow.following;
      return {
        _id: following._id.toString(),
        followId: follow._id.toString(),
        username: following.username,
        firstname: following.firstname,
        lastname: following.lastname,
        image: following.image,
        userType: following.userType,
      };
    });
  }
}

export default FindFollowingAction;
