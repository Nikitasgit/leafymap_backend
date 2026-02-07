import { Schema, model } from "mongoose";
import {
  INotification,
  NotificationReferenceType,
  NotificationActionType,
} from "@/types/models/notification";

const notificationSchema = new Schema<INotification>(
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
      enum: [
        "message",
        "partnership_invitation",
        "partnership_accepted",
        "event_invitation",
        "event_accepted",
        "review",
        "other",
      ] as NotificationActionType[],
    },
    reference: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },
    referenceType: {
      type: String,
      required: true,
      enum: [
        "Place",
        "Event",
        "Partnership",
        "Conversation",
        "Message",
      ] as NotificationReferenceType[],
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

export default model<INotification>("Notification", notificationSchema);
