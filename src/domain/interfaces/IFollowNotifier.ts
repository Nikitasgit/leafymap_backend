import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IFollowNotifier {
  notifyNewFollower(params: {
    senderId: UserId;
    receiverId: UserId;
    followId: FollowId;
  }): Promise<void>;
}
