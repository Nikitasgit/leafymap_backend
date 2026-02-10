import { IFollowRepository } from "@/types/repositories/follow.repository.types";
import { Types } from "mongoose";

export interface FollowUser {
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

export interface IFindFollowersAction {
  execute(params: {
    userId: string;
  }): Promise<FollowUser[]>;
}

class FindFollowersAction implements IFindFollowersAction {
  constructor(private followRepository: IFollowRepository) {}

  async execute({ userId }: { userId: string }): Promise<FollowUser[]> {
    const follows = await this.followRepository.findAll({
      filters: {
        following: userId,
      },
      project: [
        "_id",
        "follower._id",
        "follower.username",
        "follower.firstname",
        "follower.lastname",
        "follower.image.urls",
        "follower.userType",
      ],
    });

    return follows.map((follow: any) => {
      const follower = follow.follower;
      return {
        _id: follower._id.toString(),
        username: follower.username,
        firstname: follower.firstname,
        lastname: follower.lastname,
        image: follower.image,
        userType: follower.userType,
      };
    });
  }
}

export default FindFollowersAction;
