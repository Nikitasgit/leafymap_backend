import { Schema, model } from "mongoose";
import { IReview, ReviewReferenceType } from "../types/models/review";

const reviewSchema = new Schema<IReview>(
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
      enum: ["Place", "Event"] as ReviewReferenceType[],
    },
    certified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index to improve query performance
reviewSchema.index({ reference: 1, referenceType: 1 });
reviewSchema.index({ author: 1, reference: 1, referenceType: 1 });

export default model<IReview>("Review", reviewSchema);
