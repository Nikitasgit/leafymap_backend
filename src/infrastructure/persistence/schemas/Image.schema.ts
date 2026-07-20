import { Schema, model, Types } from "mongoose";
import { IMAGE_REFERENCE_TYPES } from "@src/domain/value-objects/ImageReferenceType.vo";
import { IMAGE_TYPES } from "@src/domain/value-objects/ImageType.vo";

export interface ImageDocumentProps {
  _id?: Types.ObjectId;
  urls: {
    original: string;
    thumbnail: string;
    medium: string;
  };
  user: Types.ObjectId;
  reference: Types.ObjectId;
  referenceType: string;
  type: string;
  originalName: string;
  size: number;
  mimetype: string;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  deleteReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const imageSchema = new Schema<ImageDocumentProps>(
  {
    urls: {
      original: { type: String, required: true },
      thumbnail: { type: String, required: true },
      medium: { type: String, required: true },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reference: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },
    referenceType: {
      type: String,
      required: true,
      enum: [...IMAGE_REFERENCE_TYPES],
    },
    type: {
      type: String,
      required: true,
      enum: [...IMAGE_TYPES],
    },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deleteReason: { type: String },
  },
  { timestamps: true }
);

export default model<ImageDocumentProps>("Image", imageSchema);
