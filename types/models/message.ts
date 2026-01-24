import { Document, Types } from "mongoose";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  deleted: boolean;
  content?: string;
  isRead: boolean;
  partnership?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
