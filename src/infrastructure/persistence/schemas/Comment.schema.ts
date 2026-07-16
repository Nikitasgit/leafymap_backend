import { Schema, model, Types } from "mongoose";
import {
  COMMENT_REFERENCE_TYPES,
  CommentReferenceType,
} from "@src/domain/value-objects/CommentReferenceType.vo";

export interface CommentDocumentProps {
  _id?: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  reference: Types.ObjectId;
  referenceType: CommentReferenceType;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  deleteReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<CommentDocumentProps>(
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
      enum: [...COMMENT_REFERENCE_TYPES],
    },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deleteReason: { type: String },
  },
  { timestamps: true }
);

commentSchema.index({ reference: 1, referenceType: 1 });

export const CommentModel = model<CommentDocumentProps>(
  "Comment",
  commentSchema
);

export default CommentModel;
