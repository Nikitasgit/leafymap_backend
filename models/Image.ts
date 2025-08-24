import { Schema, model } from "mongoose";

const imageSchema = new Schema({
  url: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, required: true },
  ownerType: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
});

export default model("Image", imageSchema);