import { Document, Types } from "mongoose";

export type ReviewReferenceType = "Place" | "Event";

export interface IReview extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  rating: number;
  comment?: string;
  reference: Types.ObjectId;
  referenceType: ReviewReferenceType;
  certified: boolean;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
