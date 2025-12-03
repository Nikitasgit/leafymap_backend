import { Document, Types } from "mongoose";

export type MessageReferenceType = "Review";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  reference: Types.ObjectId;
  referenceType: MessageReferenceType;
  createdAt: Date;
  updatedAt: Date;
}
