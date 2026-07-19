import { Notification } from "@src/domain/entities/Notification.entity";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import { NotificationReferenceType } from "@src/domain/value-objects/NotificationReferenceType.vo";
import {
  NotificationId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface NotificationSenderReadModel {
  _id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  image?: {
    urls?: {
      original?: string;
      thumbnail?: string;
      medium?: string;
    };
  };
  googlePictureUrl?: string;
}

export interface NotificationListItem {
  _id: string;
  action: NotificationAction;
  reference: string;
  referenceType: NotificationReferenceType;
  read?: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  sender?: NotificationSenderReadModel;
}

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
  ): Promise<NotificationListItem[]>;
  markAsReadByAction(
    receiverId: UserId,
    action: NotificationAction
  ): Promise<number>;
  markAllAsRead(receiverId: UserId): Promise<number>;
  existsRecentSimilar(params: ExistsRecentSimilarParams): Promise<boolean>;
  deleteByReferences(referenceIds: ReferenceId[]): Promise<void>;
  deleteByUser(userId: UserId): Promise<void>;
}
