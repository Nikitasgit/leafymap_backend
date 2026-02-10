import { IFollowRepository } from "@/types/repositories/follow.repository.types";
import { IFollow } from "@/types/models/follow";
import { Types } from "mongoose";
import FollowService from "@/services/followService";
import NotificationService from "@/services/notificationService";

export interface ICreateFollowAction {
  execute(params: {
    followerId: string;
    followingId: string;
  }): Promise<{ _id: string }>;
}

class CreateFollowAction implements ICreateFollowAction {
  private followService: FollowService;

  constructor(
    private followRepository: IFollowRepository,
    followService: FollowService,
    private notificationService: NotificationService
  ) {
    this.followService = followService;
  }

  async execute({
    followerId,
    followingId,
  }: {
    followerId: string;
    followingId: string;
  }): Promise<{ _id: string }> {
    if (followerId === followingId) {
      throw new Error("You cannot follow yourself");
    }
    const existingFollow = await this.followRepository.findOne({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    } as any);

    if (existingFollow) {
      throw new Error("You are already following this user");
    }

    const followId = await this.followRepository.create({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    } as Partial<IFollow>);

    await this.followService.incrementFollowersCount(followingId);

    await this.notificationService.createNotification({
      sender: followerId,
      receiver: followingId,
      action: "new_follower",
      reference: followId.toString(),
      referenceType: "Follow",
    });

    return { _id: followId.toString() };
  }
}

export default CreateFollowAction;
