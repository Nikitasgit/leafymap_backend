import { Document, Types } from "mongoose";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  recipientId: Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
