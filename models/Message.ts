import { Schema, model } from "mongoose";
import { IMessage, MessageReferenceType } from "../types/models/message";

const messageSchema = new Schema<IMessage>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    reference: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },
    referenceType: {
      type: String,
      required: true,
      enum: ["Review"] as MessageReferenceType[],
    },
  },
  { timestamps: true }
);

// Index to improve query performance
messageSchema.index({ reference: 1, referenceType: 1 });

export default model<IMessage>("Message", messageSchema);
