import CreateNotificationUseCase from "@src/application/usecases/notifications/CreateNotification.usecase";
import { IFollowNotifier } from "@src/domain/interfaces/IFollowNotifier";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";

class FollowNotifierAdapter implements IFollowNotifier {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase
  ) {}

  async notifyNewFollower(params: {
    senderId: UserId;
    receiverId: UserId;
    followId: FollowId;
  }): Promise<void> {
    await this.createNotificationUseCase.execute({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "new_follower",
      referenceId: params.followId,
      referenceType: "Follow",
    });
  }
}

export default FollowNotifierAdapter;
