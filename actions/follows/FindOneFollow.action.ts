import { IFollowRepository } from "@/types/repositories/follow.repository.types";
import { IFollow } from "@/types/models/follow";
import { Types } from "mongoose";

export interface IFindOneFollowAction {
  execute(params: {
    followerId: string;
    followingId: string;
  }): Promise<IFollow | null>;
}

class FindOneFollowAction implements IFindOneFollowAction {
  constructor(private followRepository: IFollowRepository) {}

  async execute({
    followerId,
    followingId,
  }: {
    followerId: string;
    followingId: string;
  }): Promise<IFollow | null> {
    const follow = await this.followRepository.findOne({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    } as any);

    return follow;
  }
}

export default FindOneFollowAction;
