import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface IPartnershipNotifier {
  notifyInvitationCreated(params: {
    senderId: UserId;
    receiverId: UserId;
    partnershipId: PartnershipId;
  }): Promise<void>;
}
