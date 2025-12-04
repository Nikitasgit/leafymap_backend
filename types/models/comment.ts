import { Document, Types } from "mongoose";

export type CommentReferenceType = "Review" | "Image" | "Comment";

export interface IComment extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  reference: Types.ObjectId;
  referenceType: CommentReferenceType;
  createdAt: Date;
  updatedAt: Date;
}
