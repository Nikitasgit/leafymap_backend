import { IPartnershipNotifier } from "@src/domain/interfaces/IPartnershipNotifier";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import NotificationService from "@/services/notificationService";

class LegacyPartnershipNotifierAdapter implements IPartnershipNotifier {
  constructor(private readonly notificationService: NotificationService) {}

  async notifyInvitationCreated(params: {
    senderId: UserId;
    receiverId: UserId;
    partnershipId: PartnershipId;
  }): Promise<void> {
    await this.notificationService.createNotification({
      sender: params.senderId,
      receiver: params.receiverId,
      action: "partnership_invitation",
      reference: params.partnershipId,
      referenceType: "Partnership",
    });
  }
}

export default LegacyPartnershipNotifierAdapter;
