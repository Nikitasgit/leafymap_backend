import { IFollowRepository } from "@/types/repositories/follow.repository.types";
import FollowService from "@/services/followService";

export interface IDeleteFollowAction {
  execute(params: {
    followId: string;
    followerId: string;
  }): Promise<void>;
}

class DeleteFollowAction implements IDeleteFollowAction {
  private followService: FollowService;

  constructor(
    private followRepository: IFollowRepository,
    followService: FollowService
  ) {
    this.followService = followService;
  }

  async execute({
    followId,
    followerId,
  }: {
    followId: string;
    followerId: string;
  }): Promise<void> {
    const follow = await this.followRepository.findById(followId, [
      "follower",
      "following",
    ]);

    if (!follow) {
      throw new Error("Follow not found");
    }

    if (follow.follower.toString() !== followerId) {
      throw new Error("You can only delete your own follows");
    }

    const followingId = follow.following.toString();

    await this.followRepository.deleteOne(followId);

    await this.followService.decrementFollowersCount(followingId);
  }
}

export default DeleteFollowAction;
