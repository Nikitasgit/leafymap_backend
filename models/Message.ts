import { Schema, model } from "mongoose";
import { IMessage } from "../types/models/message";

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, recipientId: 1 });
messageSchema.index({ recipientId: 1, isRead: 1 });

export default model<IMessage>("Message", messageSchema);
