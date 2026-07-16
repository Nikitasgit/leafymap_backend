import { IFollowNotifier } from "@src/domain/interfaces/IFollowNotifier";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import NotificationService from "@/services/notificationService";

class LegacyFollowNotifierAdapter implements IFollowNotifier {
  constructor(private readonly notificationService: NotificationService) {}

  async notifyNewFollower(params: {
    senderId: UserId;
    receiverId: UserId;
    followId: FollowId;
  }): Promise<void> {
    await this.notificationService.createNotification({
      sender: params.senderId,
      receiver: params.receiverId,
      action: "new_follower",
      reference: params.followId,
      referenceType: "Follow",
    });
  }
}

export default LegacyFollowNotifierAdapter;
