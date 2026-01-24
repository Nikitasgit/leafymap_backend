import { Schema, model } from "mongoose";
import { IMessage } from "@/types/models/message";

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    partnership: {
      type: Schema.Types.ObjectId,
      ref: "Partnership",
      required: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, isRead: 1 });
messageSchema.index({ partnership: 1 });

export default model<IMessage>("Message", messageSchema);
