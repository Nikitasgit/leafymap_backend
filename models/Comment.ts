import { Schema, model } from "mongoose";
import { IComment, CommentReferenceType } from "@/types/models/comment";

const commentSchema = new Schema<IComment>(
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
      enum: ["Review", "Image", "Comment"] as CommentReferenceType[],
    },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deleteReason: { type: String },
  },
  { timestamps: true }
);

// Index to improve query performance
commentSchema.index({ reference: 1, referenceType: 1 });

export default model<IComment>("Comment", commentSchema);
