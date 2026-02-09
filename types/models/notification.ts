import { Document, Types } from "mongoose";

export type NotificationReferenceType =
  | "Place"
  | "Event"
  | "Partnership"
  | "Conversation"
  | "Message";

export type NotificationActionType =
  | "message"
  | "partnership_invitation"
  | "partnership_accepted"
  | "event_invitation"
  | "event_accepted"
  | "event_refused"
  | "review"
  | "other";

export interface INotification extends Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  message?: string;
  action: NotificationActionType;
  reference: Types.ObjectId;
  referenceType: NotificationReferenceType;
  read?: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
