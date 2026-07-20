import { INotificationCreator } from "@src/domain/interfaces/INotificationCreator";
import { IPartnershipNotifier } from "@src/domain/interfaces/IPartnershipNotifier";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

class PartnershipNotifierAdapter implements IPartnershipNotifier {
  constructor(private readonly notificationCreator: INotificationCreator) {}

  async notifyInvitationCreated(params: {
    senderId: UserId;
    receiverId: UserId;
    partnershipId: PartnershipId;
  }): Promise<void> {
    await this.notificationCreator.create({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "partnership_invitation",
      referenceId: params.partnershipId,
      referenceType: "Partnership",
    });
  }
}

export default PartnershipNotifierAdapter;
