import { Document, Types } from "mongoose";

export type NotificationReferenceType =
  | "Place"
  | "Event"
  | "Partnership"
  | "Conversation"
  | "Message"
  | "Follow";

export type NotificationActionType =
  | "message"
  | "partnership_invitation"
  | "partnership_accepted"
  | "event_invitation"
  | "event_accepted"
  | "event_refused"
  | "review"
  | "new_follower"
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
