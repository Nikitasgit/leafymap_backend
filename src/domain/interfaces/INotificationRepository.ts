import { Notification } from "@src/domain/entities/Notification.entity";
import { NotificationListItemReadModel } from "@src/domain/read-models/notification.read-models";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import { NotificationReferenceType } from "@src/domain/value-objects/NotificationReferenceType.vo";
import {
  NotificationId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface ExistsRecentSimilarParams {
  excludeId: NotificationId;
  receiverId: UserId;
  action: NotificationAction;
  since: Date;
  senderId?: UserId;
  referenceId?: ReferenceId;
  referenceType?: NotificationReferenceType;
}

export interface INotificationRepository {
  save(notification: Notification): Promise<NotificationId>;
  findRecentForReceiver(
    receiverId: UserId,
    options?: { limit?: number }
  ): Promise<NotificationListItemReadModel[]>;
  markAsReadByAction(
    receiverId: UserId,
    action: NotificationAction
  ): Promise<number>;
  markAllAsRead(receiverId: UserId): Promise<number>;
  existsRecentSimilar(params: ExistsRecentSimilarParams): Promise<boolean>;
  deleteByReferences(referenceIds: ReferenceId[]): Promise<void>;
  deleteByUser(userId: UserId): Promise<void>;
}
