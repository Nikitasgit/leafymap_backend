import { Schema, model, Types } from "mongoose";

export interface MessageDocumentProps {
  _id?: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  deleted?: boolean;
  content?: string;
  readBy: Types.ObjectId[];
  partnership?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<MessageDocumentProps>(
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
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    partnership: {
      type: Schema.Types.ObjectId,
      ref: "Partnership",
      required: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, readBy: 1 });
messageSchema.index({ partnership: 1 });

export default model<MessageDocumentProps>(
  "Message",
  messageSchema
);
