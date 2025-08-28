import { Schema, model } from "mongoose";

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
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
      enum: ["Place", "User", "Event", "Message", "Review"],
    },
    type: {
      type: String,
      required: true,
      enum: ["profile", "cover", "gallery", "other"],
    },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Image", imageSchema);
