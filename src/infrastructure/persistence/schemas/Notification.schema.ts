import { Schema, model, Types } from "mongoose";
import {
  NOTIFICATION_ACTIONS,
  NotificationAction,
} from "@src/domain/value-objects/NotificationAction.vo";
import {
  NOTIFICATION_REFERENCE_TYPES,
  NotificationReferenceType,
} from "@src/domain/value-objects/NotificationReferenceType.vo";

export interface NotificationDocumentProps {
  _id?: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  message?: string;
  action: NotificationAction;
  reference: Types.ObjectId;
  referenceType: NotificationReferenceType;
  read?: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<NotificationDocumentProps>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    action: {
      type: String,
      required: true,
      enum: [...NOTIFICATION_ACTIONS],
    },
    reference: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },
    referenceType: {
      type: String,
      required: true,
      enum: [...NOTIFICATION_REFERENCE_TYPES],
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ receiver: 1, createdAt: -1 });
notificationSchema.index({ reference: 1, referenceType: 1 });

export default model<NotificationDocumentProps>(
  "Notification",
  notificationSchema
);
