import CreateNotificationUseCase from "@src/application/usecases/notifications/CreateNotification.usecase";
import { IPartnershipNotifier } from "@src/domain/interfaces/IPartnershipNotifier";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

class PartnershipNotifierAdapter implements IPartnershipNotifier {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase
  ) {}

  async notifyInvitationCreated(params: {
    senderId: UserId;
    receiverId: UserId;
    partnershipId: PartnershipId;
  }): Promise<void> {
    await this.createNotificationUseCase.execute({
      senderId: params.senderId,
      receiverId: params.receiverId,
      action: "partnership_invitation",
      referenceId: params.partnershipId,
      referenceType: "Partnership",
    });
  }
}

export default PartnershipNotifierAdapter;
