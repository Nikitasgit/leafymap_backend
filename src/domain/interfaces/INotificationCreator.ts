import {
  NotificationId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import { NotificationReferenceType } from "@src/domain/value-objects/NotificationReferenceType.vo";

export interface CreateNotificationParams {
  senderId: UserId;
  receiverId: UserId;
  action: NotificationAction | string;
  referenceId: ReferenceId | string;
  referenceType: NotificationReferenceType | string;
}

export interface INotificationCreator {
  create(params: CreateNotificationParams): Promise<NotificationId>;
}
