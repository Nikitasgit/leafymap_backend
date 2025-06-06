import mongoose, { Schema, model, Document } from "mongoose";

export interface IPlaceCategory extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const placeCategorySchema = new Schema<IPlaceCategory>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

export default model<IPlaceCategory>("PlaceCategory", placeCategorySchema);
