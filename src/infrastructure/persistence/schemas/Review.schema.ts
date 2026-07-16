import { Schema, model, Types } from "mongoose";
import {
  REVIEW_REFERENCE_TYPES,
  ReviewReferenceType,
} from "@src/domain/value-objects/ReviewReferenceType.vo";

export interface ReviewDocumentProps {
  _id?: Types.ObjectId;
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
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<ReviewDocumentProps>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
    },
    reference: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },
    referenceType: {
      type: String,
      required: true,
      enum: [...REVIEW_REFERENCE_TYPES],
    },
    certified: {
      type: Boolean,
      default: false,
    },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deleteReason: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ reference: 1, referenceType: 1 });
reviewSchema.index(
  { author: 1, reference: 1, referenceType: 1 },
  { unique: true }
);

export const ReviewModel = model<ReviewDocumentProps>("Review", reviewSchema);

export default ReviewModel;
