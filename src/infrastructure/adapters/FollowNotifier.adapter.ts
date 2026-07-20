import { IFollowNotifier } from "@src/domain/interfaces/IFollowNotifier";
import { INotificationCreator } from "@src/domain/interfaces/INotificationCreator";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";

class FollowNotifierAdapter implements IFollowNotifier {
  constructor(private readonly notificationCreator: INotificationCreator) {}

  async notifyNewFollower(params: {
    senderId: UserId;
    receiverId: UserId;
    followId: FollowId;
  }): Promise<void> {
    await this.notificationCreator.create({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "new_follower",
      referenceId: params.followId,
      referenceType: "Follow",
    });
  }
}

export default FollowNotifierAdapter;
