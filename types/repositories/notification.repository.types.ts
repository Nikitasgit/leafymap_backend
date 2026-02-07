import {
  INotification,
  NotificationActionType,
  NotificationReferenceType,
} from "@/types/models/notification";
import { Types } from "mongoose";

export interface NotificationFilters {
  receiver?: string;
  action?: NotificationActionType;
  read?: boolean | { $ne: true };
  [key: string]: unknown;
}

export interface NotificationSenderPopulated {
  _id: Types.ObjectId;
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
}

export interface NotificationWithSender {
  _id: Types.ObjectId;
  action: NotificationActionType;
  reference: Types.ObjectId;
  referenceType: NotificationReferenceType;
  read?: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  sender?: NotificationSenderPopulated;
}

export interface INotificationRepository {
  create(notification: Partial<INotification>): Promise<Types.ObjectId>;
  findAll(params: {
    filters?: NotificationFilters;
    project: (keyof INotification | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<NotificationWithSender[]>;
  markAsRead(
    notificationIds: Types.ObjectId[],
    receiverId: string
  ): Promise<number>;
  markAllUserNotificationsAsRead(receiverId: string): Promise<number>;
}
