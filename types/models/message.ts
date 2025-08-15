import { Document, Types } from "mongoose";

// Message-related interfaces
export interface IMessageContext {
  event?: Types.ObjectId;
  place?: Types.ObjectId;
  application?: Types.ObjectId;
}

export interface IMessageAttachment {
  type: string; // URL to the attachment
  name: string;
  size: number;
  mimeType: string;
}

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  conversationType: "direct" | "event" | "place" | "application";
  context: IMessageContext;
  attachments: IMessageAttachment[];
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
