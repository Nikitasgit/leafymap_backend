import { Notification } from "@src/domain/entities/Notification.entity";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import { NotificationReferenceType } from "@src/domain/value-objects/NotificationReferenceType.vo";
import {
  NotificationId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { NotificationDocumentProps } from "@src/infrastructure/persistence/schemas/Notification.schema";
import { Types } from "mongoose";

export class NotificationMapper {
  static toDomain(
    doc: NotificationDocumentProps & { _id: Types.ObjectId }
  ): Notification {
    return Notification.reconstitute({
      id: NotificationId.from(doc._id.toString()),
      senderId: UserId.from(doc.sender.toString()),
      receiverId: UserId.from(doc.receiver.toString()),
      action: NotificationAction.from(doc.action),
      referenceId: ReferenceId.from(doc.reference.toString()),
      referenceType: NotificationReferenceType.from(doc.referenceType),
      read: doc.read === true,
      readAt: doc.readAt,
      message: doc.message,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    notification: Notification
  ): Omit<NotificationDocumentProps, "_id"> {
    return {
      sender: new Types.ObjectId(notification.senderId),
      receiver: new Types.ObjectId(notification.receiverId),
      message: notification.message,
      action: notification.action,
      reference: new Types.ObjectId(notification.referenceId),
      referenceType: notification.referenceType,
      read: notification.read,
      readAt: notification.readAt,
    };
  }
}
