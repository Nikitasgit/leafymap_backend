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
  action: NotificationAction;
  referenceId: ReferenceId;
  referenceType: NotificationReferenceType;
  message?: string;
}

export interface ReconstituteNotificationParams extends CreateNotificationParams {
  id: NotificationId;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Notification {
  private constructor(
    public readonly id: NotificationId | null,
    public readonly senderId: UserId,
    public readonly receiverId: UserId,
    public readonly action: NotificationAction,
    public readonly referenceId: ReferenceId,
    public readonly referenceType: NotificationReferenceType,
    public readonly read: boolean,
    public readonly readAt: Date | undefined,
    public readonly message: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateNotificationParams): Notification {
    const now = new Date();
    return new Notification(
      null,
      params.senderId,
      params.receiverId,
      params.action,
      params.referenceId,
      params.referenceType,
      false,
      undefined,
      params.message,
      now,
      now
    );
  }

  static reconstitute(params: ReconstituteNotificationParams): Notification {
    return new Notification(
      params.id,
      params.senderId,
      params.receiverId,
      params.action,
      params.referenceId,
      params.referenceType,
      params.read,
      params.readAt,
      params.message,
      params.createdAt,
      params.updatedAt
    );
  }

  belongsToReceiver(userId: UserId): boolean {
    return this.receiverId === userId;
  }

  markAsRead(now = new Date()): Notification {
    if (this.read) {
      return this;
    }
    return new Notification(
      this.id,
      this.senderId,
      this.receiverId,
      this.action,
      this.referenceId,
      this.referenceType,
      true,
      now,
      this.message,
      this.createdAt,
      now
    );
  }
}
